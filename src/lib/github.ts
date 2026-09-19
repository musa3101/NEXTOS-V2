/**
 * GitHub API Client for NextOS Assistant
 * Allows the Telegram/WhatsApp bot to inspect repository activity, recent commits,
 * file changes, workflows and overall health of Musa's GitHub repositories.
 */

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DEFAULT_OWNER = "musa3101";
const DEFAULT_REPO = "NEXTOS-V2";

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN || GITHUB_TOKEN;
  const headers: HeadersInit = {
    "User-Agent": "NextOS-V2-Assistant",
    "Accept": "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface CommitSummary {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface CommitDetail extends CommitSummary {
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
  files: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patchSnippet?: string;
  }>;
}

/**
 * Fetch the latest commits for a repository
 */
export async function getLatestCommits(
  repo: string = DEFAULT_REPO,
  limit: number = 5,
  owner: string = DEFAULT_OWNER
): Promise<CommitSummary[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      { headers: getHeaders(), next: { revalidate: 30 } }
    );

    if (!res.ok) {
      console.error(`GitHub getLatestCommits failed: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((c: any) => ({
      sha: (c.sha || "").substring(0, 7),
      message: c.commit?.message || "Sin mensaje",
      author: c.commit?.author?.name || c.author?.login || "Desconocido",
      date: c.commit?.author?.date || "",
      url: c.html_url || "",
    }));
  } catch (err) {
    console.error("Error fetching GitHub commits:", err);
    return [];
  }
}

/**
 * Fetch detailed file changes and diff statistics for a specific commit
 */
export async function getCommitDetails(
  sha: string,
  repo: string = DEFAULT_REPO,
  owner: string = DEFAULT_OWNER
): Promise<CommitDetail | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
      { headers: getHeaders(), next: { revalidate: 60 } }
    );

    if (!res.ok) {
      console.error(`GitHub getCommitDetails failed: ${res.status}`);
      return null;
    }

    const c = await res.json();
    return {
      sha: (c.sha || "").substring(0, 7),
      message: c.commit?.message || "",
      author: c.commit?.author?.name || c.author?.login || "Desconocido",
      date: c.commit?.author?.date || "",
      url: c.html_url || "",
      stats: c.stats || { total: 0, additions: 0, deletions: 0 },
      files: (c.files || []).slice(0, 15).map((f: any) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        patchSnippet: f.patch ? f.patch.substring(0, 300) : undefined,
      })),
    };
  } catch (err) {
    console.error("Error fetching commit details:", err);
    return null;
  }
}

/**
 * Get repository general status: default branch, open issues, forks, last push
 */
export async function getRepositoryStatus(
  repo: string = DEFAULT_REPO,
  owner: string = DEFAULT_OWNER
): Promise<any> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: getHeaders(),
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { error: `HTTP ${res.status} al consultar ${owner}/${repo}` };
    }

    const d = await res.json();
    const commits = await getLatestCommits(repo, 3, owner);

    return {
      name: d.name,
      fullName: d.full_name,
      description: d.description || "Sin descripción",
      defaultBranch: d.default_branch,
      visibility: d.visibility || (d.private ? "private" : "public"),
      openIssuesCount: d.open_issues_count,
      pushedAt: d.pushed_at,
      updatedAt: d.updated_at,
      latestCommits: commits,
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * List Musa's GitHub repositories
 */
export async function listUserRepositories(limit: number = 10): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=${limit}`,
      { headers: getHeaders(), next: { revalidate: 60 } }
    );

    if (!res.ok) return [];
    const repos = await res.json();
    if (!Array.isArray(repos)) return [];

    return repos.map((r: any) => ({
      name: r.name,
      fullName: r.full_name,
      private: r.private,
      pushedAt: r.pushed_at,
      description: r.description,
      language: r.language,
    }));
  } catch (err) {
    console.error("Error listing repositories:", err);
    return [];
  }
}

/**
 * Fetch GitHub Actions workflow runs (to detect failed builds / tests)
 */
export async function getWorkflowRuns(
  repo: string = DEFAULT_REPO,
  owner: string = DEFAULT_OWNER,
  limit: number = 5
): Promise<any> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${limit}`,
      { headers: getHeaders(), next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return { totalCount: 0, runs: [] };
    }

    const data = await res.json();
    return {
      totalCount: data.total_count || 0,
      runs: (data.workflow_runs || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        conclusion: r.conclusion, // success, failure, cancelled
        headBranch: r.head_branch,
        commitMessage: r.head_commit?.message,
        createdAt: r.created_at,
        url: r.html_url,
      })),
    };
  } catch (err: any) {
    return { totalCount: 0, runs: [], error: err.message };
  }
}
