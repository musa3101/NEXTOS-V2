export interface CloudflareProject {
  name: string;
  id: string;
  subdomain: string;
  created_on: string;
  latest_deployment?: {
    id: string;
    status: string;
    environment: string;
    url: string;
  };
}

export async function validateCloudflareConnection(): Promise<{ success: boolean; error?: string }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!token || !accountId) {
    return { success: false, error: "Missing Cloudflare credentials in environment variables" };
  }

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.errors?.[0]?.message || `HTTP error ${res.status}`;
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    return { success: data.success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCloudflareProjects(): Promise<CloudflareProject[]> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error("Missing Cloudflare credentials");
  }

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.errors?.[0]?.message || `Failed to fetch Cloudflare projects (HTTP ${res.status})`);
  }

  const data = await res.json();
  return data.result || [];
}

// Prepared structure for future deploy from NextOS
export async function triggerCloudflareDeploy(projectId: string, branch: string = "main"): Promise<{ success: boolean; deploymentId?: string }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error("Missing Cloudflare credentials");
  }

  // Prepares the HTTP call structure without fully executing deployment until phase 2 configuration is verified
  console.log(`[Cloudflare Deploy] Prepared deploy invocation for project ${projectId} on branch ${branch}`);
  
  // Real endpoint: POST https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectId}/deployments
  return { success: true, deploymentId: "mock-deploy-id-phase-2-ready" };
}
