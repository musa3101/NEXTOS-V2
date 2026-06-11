import { supabaseAdmin } from "@/lib/supabase/server";
import { getCloudflareProjects } from "@/lib/cloudflare";

// Fuzzy match cleanups
export function cleanName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/[^a-z0-9]/g, ""); // keep alphanumeric only
}

export function matchNames(nameA: string, nameB: string): boolean {
  const cleanA = cleanName(nameA);
  const cleanB = cleanName(nameB);
  if (!cleanA || !cleanB) return false;
  return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA);
}

export async function syncCloudflareProjectsToClients() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!token || !accountId) {
    console.log("[CF Sync] Missing Cloudflare credentials. Skipping sync.");
    return;
  }

  try {
    const cfProjects = await getCloudflareProjects();
    if (!cfProjects || cfProjects.length === 0) {
      console.log("[CF Sync] No projects found in Cloudflare.");
      return;
    }

    console.log(`[CF Sync] Syncing ${cfProjects.length} Cloudflare projects to database clients...`);

    // Fetch all current clients to match locally
    const { data: clientsData, error: clientsErr } = await supabaseAdmin
      .from("clients")
      .select("*");

    if (clientsErr || !clientsData) {
      throw new Error(`Failed to fetch clients for sync: ${clientsErr?.message}`);
    }

    const clients = clientsData as any[];

    for (const cfProj of cfProjects) {
      // Find matching client by name or company
      let matchedClient = clients.find(c => 
        matchNames(c.name, cfProj.name) || 
        (c.company && matchNames(c.company, cfProj.name))
      );

      let clientId: string;

      if (!matchedClient) {
        // Create a new client automatically
        const formattedName = cfProj.name.charAt(0).toUpperCase() + cfProj.name.slice(1);
        console.log(`[CF Sync] Creating new client profile for Cloudflare site: ${formattedName}`);
        
        const { data: newClient, error: createErr } = await (supabaseAdmin
          .from("clients") as any)
          .insert({
            name: formattedName,
            company: formattedName,
            status: "active",
            notes: `Auto-generated from Cloudflare project: ${cfProj.name}`
          } as any)
          .select()
          .single();

        if (createErr || !newClient) {
          console.error(`[CF Sync] Failed to create client for ${cfProj.name}:`, createErr?.message);
          continue;
        }

        matchedClient = newClient as any;
        clientId = (newClient as any).id;
        
        // Add to local array so subsequent matching loops can find it
        clients.push(matchedClient);
      } else {
        clientId = matchedClient.id;
      }

      // Check if project exists in database
      const { data: existingProjData } = await supabaseAdmin
        .from("projects")
        .select("id, client_id")
        .eq("name", cfProj.name)
        .limit(1)
        .maybeSingle();

      const existingProj = existingProjData as any;

      const startD = cfProj.created_on 
        ? new Date(cfProj.created_on).toISOString().split("T")[0] 
        : new Date().toISOString().split("T")[0];

      if (!existingProj) {
        // Create project
        console.log(`[CF Sync] Inserting project: ${cfProj.name} connected to client ID: ${clientId}`);
        const { error: insertErr } = await (supabaseAdmin.from("projects") as any).insert({
          client_id: clientId,
          name: cfProj.name,
          description: `Cloudflare Pages Site - Subdomain: ${cfProj.subdomain || 'N/A'}`,
          status: "published",
          budget: 0,
          start_date: startD
        } as any);
        if (insertErr) {
          console.error(`[CF Sync] Failed to insert project for ${cfProj.name}:`, insertErr.message);
        }
      } else if (existingProj.client_id !== clientId) {
        // Update project to point to the correct matched client instead of generic internal
        console.log(`[CF Sync] Updating project: ${cfProj.name} to link with client ID: ${clientId}`);
        const { error: updateErr } = await (supabaseAdmin
          .from("projects") as any)
          .update({ client_id: clientId })
          .eq("id", existingProj.id);
        if (updateErr) {
          console.error(`[CF Sync] Failed to update project for ${cfProj.name}:`, updateErr.message);
        }
      }
    }
    console.log("[CF Sync] Synchronization completed successfully.");
  } catch (err: any) {
    console.error("[CF Sync] Error during synchronization:", err.message);
  }
}
