import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLatestCommits,
  getCommitDetails,
  getRepositoryStatus,
  listUserRepositories,
  getWorkflowRuns,
} from "@/lib/github";

describe("GitHub Client (src/lib/github.ts)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("getLatestCommits formats commit list correctly", async () => {
    const mockCommits = [
      {
        sha: "abc1234567890",
        commit: {
          message: "feat: add luxury styling",
          author: { name: "Musa", date: "2026-09-19T10:00:00Z" },
        },
        html_url: "https://github.com/musa3101/NEXTOS-V2/commit/abc1234",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockCommits,
    } as any);

    const commits = await getLatestCommits("NEXTOS-V2", 1);
    expect(commits).toHaveLength(1);
    expect(commits[0].sha).toBe("abc1234");
    expect(commits[0].message).toBe("feat: add luxury styling");
    expect(commits[0].author).toBe("Musa");
  });

  it("getCommitDetails returns file stats and changed files", async () => {
    const mockDetail = {
      sha: "def5678901234",
      commit: {
        message: "fix: pdf templates",
        author: { name: "Musa", date: "2026-09-19T11:00:00Z" },
      },
      stats: { total: 10, additions: 8, deletions: 2 },
      files: [
        {
          filename: "src/lib/pdf/invoice-template.tsx",
          status: "modified",
          additions: 8,
          deletions: 2,
          patch: "@@ -1,2 +1,2 @@",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDetail,
    } as any);

    const details = await getCommitDetails("def5678");
    expect(details).not.toBeNull();
    expect(details?.sha).toBe("def5678");
    expect(details?.stats.total).toBe(10);
    expect(details?.files[0].filename).toBe("src/lib/pdf/invoice-template.tsx");
  });

  it("getWorkflowRuns parses actions status and conclusions", async () => {
    const mockRuns = {
      total_count: 1,
      workflow_runs: [
        {
          id: 998877,
          name: "CI Tests",
          status: "completed",
          conclusion: "success",
          head_branch: "main",
          head_commit: { message: "test commit" },
          created_at: "2026-09-19T12:00:00Z",
          html_url: "https://github.com/musa3101/NEXTOS-V2/actions/runs/998877",
        },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRuns,
    } as any);

    const result = await getWorkflowRuns("NEXTOS-V2");
    expect(result.totalCount).toBe(1);
    expect(result.runs[0].conclusion).toBe("success");
    expect(result.runs[0].name).toBe("CI Tests");
  });
});
