import { NextResponse } from "next/server";
import { triggerCloudflareDeploy } from "@/lib/cloudflare";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectName, branch = "main" } = body;

    if (!projectName) {
      return NextResponse.json(
        { error: "El nombre del proyecto es obligatorio" },
        { status: 400 }
      );
    }

    const result = await triggerCloudflareDeploy(projectName, branch);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Fallo al disparar el despliegue en Cloudflare" },
        { status: 500 }
      );
    }

    await logActivity({
      action: "triggered_deploy",
      entityType: "project",
      details: { projectName, branch, deploymentId: result.deploymentId },
      source: "web",
    });

    return NextResponse.json({
      success: true,
      deploymentId: result.deploymentId,
      url: result.url,
      message: `Despliegue activado correctamente para ${projectName}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
