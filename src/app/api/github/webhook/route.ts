import { NextRequest, NextResponse } from "next/server";
import { sendMessage } from "@/lib/telegram";
import { logActivity } from "@/lib/activity";

const ADMIN_CHAT_ID = process.env.TELEGRAM_AUTHORIZED_USER_ID || "5097297239";

/**
 * GitHub Webhook Handler
 * Receives real-time push, workflow_run and commit alerts from GitHub.
 * Automatically notifies Musa via Telegram if tests fail or new code is pushed.
 */
export async function POST(req: NextRequest) {
  try {
    const event = req.headers.get("x-github-event");
    const payload = await req.json();

    if (!payload) {
      return NextResponse.json({ ok: false, message: "No payload" }, { status: 400 });
    }

    // 1. Workflow Run event (CI/CD, tests, build status)
    if (event === "workflow_run") {
      const action = payload.action;
      const workflow = payload.workflow_run;

      if (action === "completed" && workflow) {
        const conclusion = workflow.conclusion; // "success", "failure", "cancelled"
        const repoName = payload.repository?.name || "NEXTOS-V2";
        const branch = workflow.head_branch || "main";
        const commitMsg = workflow.head_commit?.message?.split("\n")[0] || "Sin mensaje";
        const commitSha = (workflow.head_commit?.id || "").substring(0, 7);
        const workflowName = workflow.name || "Build & Test";

        if (conclusion === "failure") {
          const alertText =
            `🚨 <b>ALERTA GITHUB CI/CD: Build Fallido</b>\n\n` +
            `📁 <b>Repo:</b> <code>${repoName}</code> (rama: <i>${branch}</i>)\n` +
            `⚙️ <b>Workflow:</b> ${workflowName}\n` +
            `❌ <b>Resultado:</b> Fallo / Error\n` +
            `📝 <b>Commit [${commitSha}]:</b> <i>${commitMsg}</i>\n\n` +
            `🔗 <a href="${workflow.html_url}">Ver logs del error en GitHub</a>`;

          await sendMessage(ADMIN_CHAT_ID, alertText);

          await logActivity({
            action: "error",
            entityType: "system",
            details: { type: "github_ci_failure", repo: repoName, workflow: workflowName, sha: commitSha },
            source: "system",
          });
        } else if (conclusion === "success") {
          // Optional: log success
          console.log(`GitHub CI passed for ${repoName} (${commitSha})`);
        }
      }

      return NextResponse.json({ ok: true, processed: "workflow_run" });
    }

    // 2. Push event (New commits deployed to repo)
    if (event === "push") {
      const repoName = payload.repository?.name || "NEXTOS-V2";
      const branch = (payload.ref || "").replace("refs/heads/", "");
      const commits = payload.commits || [];
      const pusher = payload.pusher?.name || "musa3101";

      if (commits.length > 0 && branch === "main") {
        const lastCommit = commits[commits.length - 1];
        const lastMsg = lastCommit.message?.split("\n")[0] || "";
        const sha = (lastCommit.id || "").substring(0, 7);

        // Notify Musa of push to main
        const pushText =
          `📦 <b>GitHub: Nuevo push en ${repoName}</b>\n\n` +
          `🌿 <b>Rama:</b> <code>${branch}</code>\n` +
          `👤 <b>Autor:</b> ${pusher}\n` +
          `🔢 <b>Commits:</b> ${commits.length}\n` +
          `📌 <b>Último:</b> [<code>${sha}</code>] <i>${lastMsg}</i>`;

        await sendMessage(ADMIN_CHAT_ID, pushText);
      }

      return NextResponse.json({ ok: true, processed: "push" });
    }

    // Ping event when setting up webhook
    if (event === "ping") {
      return NextResponse.json({ ok: true, message: "GitHub webhook connected successfully" });
    }

    return NextResponse.json({ ok: true, ignoredEvent: event });
  } catch (error: any) {
    console.error("GitHub webhook error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
