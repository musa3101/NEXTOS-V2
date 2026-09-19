import { NextResponse } from "next/server";
import { getCloudflareProjects, getPrimaryProjectUrl } from "@/lib/cloudflare";
import { insforgeAdmin } from "@/lib/insforge/server";
import { logActivity } from "@/lib/activity";

export interface ProjectMaintenanceItem {
  id: string;
  name: string;
  clientName: string;
  url: string;
  createdOn: string;
  lastMaintenanceOn: string;
  nextMaintenanceOn: string;
  cycleDays: number;
  daysRemaining: number;
  status: "ok" | "warning" | "urgent";
  googleCalendarUrl: string;
  checklist: {
    backups: boolean;
    sslDns: boolean;
    depsSecurity: boolean;
    speedAudit: boolean;
  };
  notes: string;
}

export function buildGoogleCalendarUrl(
  projectName: string,
  targetDate: string,
  url: string,
  clientName: string
): string {
  const d = new Date(targetDate);
  const startYear = d.getUTCFullYear();
  const startMonth = String(d.getUTCMonth() + 1).padStart(2, "0");
  const startDay = String(d.getUTCDate()).padStart(2, "0");
  
  // Schedule from 10:00 to 11:00 UTC
  const startTime = `${startYear}${startMonth}${startDay}T100000Z`;
  const endTime = `${startYear}${startMonth}${startDay}T110000Z`;

  const title = encodeURIComponent(`🛠️ Mantenimiento Web: ${projectName} (${clientName})`);
  const details = encodeURIComponent(
    `Revisión técnica programada por NEXTOS para el proyecto ${projectName}.\n\n` +
    `🌐 Web: ${url}\n` +
    `👤 Cliente: ${clientName}\n\n` +
    `📋 Tareas a realizar:\n` +
    `- [ ] Verificación de certificados SSL y DNS en Cloudflare\n` +
    `- [ ] Copia de seguridad de base de datos y contenidos\n` +
    `- [ ] Actualización de librerías y parches de seguridad\n` +
    `- [ ] Auditoría de velocidad y Core Web Vitals (TestSprite / Lighthouse)\n` +
    `- [ ] Informe de salud entregado al cliente`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${encodeURIComponent(url)}`;
}

export async function GET() {
  try {
    const cfProjects = await getCloudflareProjects();
    const { data: dbProjects } = await insforgeAdmin.from("projects").select("*, clients(name, company)");

    const now = new Date();

    const items: ProjectMaintenanceItem[] = cfProjects.map((cf, index) => {
      const { url } = getPrimaryProjectUrl(cf);
      
      // Match with database project if available
      const dbMatch = (dbProjects || []).find((p: any) => 
        p.name.toLowerCase() === cf.name.toLowerCase() ||
        cf.name.toLowerCase().includes(p.name.toLowerCase())
      );

      const clientName = dbMatch?.clients?.name || dbMatch?.clients?.company || "Cliente MYNEXT";
      const createdOn = cf.created_on || dbMatch?.created_at || new Date(Date.now() - 60 * 86400000).toISOString();
      
      // Compute cycle: default 60 days
      const cycleDays = 60;
      const createdTime = new Date(createdOn).getTime();
      const elapsedDays = Math.floor((now.getTime() - createdTime) / (1000 * 60 * 60 * 24));
      
      // Last maintenance calculated or default to previous cycle
      const cyclesCompleted = Math.max(0, Math.floor(elapsedDays / cycleDays));
      const lastMaintenanceTime = createdTime + (cyclesCompleted * cycleDays * 86400000);
      const nextMaintenanceTime = lastMaintenanceTime + (cycleDays * 86400000);

      const lastMaintenanceOn = new Date(lastMaintenanceTime).toISOString();
      const nextMaintenanceOn = new Date(nextMaintenanceTime).toISOString();

      const daysRemaining = Math.ceil((nextMaintenanceTime - now.getTime()) / (1000 * 60 * 60 * 24));

      let status: "ok" | "warning" | "urgent" = "ok";
      if (daysRemaining <= 0) {
        status = "urgent";
      } else if (daysRemaining <= 10) {
        status = "warning";
      }

      const googleCalendarUrl = buildGoogleCalendarUrl(
        cf.name,
        nextMaintenanceOn,
        url,
        clientName
      );

      return {
        id: cf.id || `cf-${index}`,
        name: cf.name,
        clientName,
        url,
        createdOn,
        lastMaintenanceOn,
        nextMaintenanceOn,
        cycleDays,
        daysRemaining,
        status,
        googleCalendarUrl,
        checklist: {
          backups: true,
          sslDns: true,
          depsSecurity: daysRemaining > 10,
          speedAudit: daysRemaining > 5,
        },
        notes: `Ciclo preventivo de ${cycleDays} días. Gestionado en Cloudflare Pages.`,
      };
    });

    // Sort by urgent first, then warning, then remaining days
    items.sort((a, b) => a.daysRemaining - b.daysRemaining);

    return NextResponse.json({
      success: true,
      count: items.length,
      urgentCount: items.filter(i => i.status === "urgent").length,
      warningCount: items.filter(i => i.status === "warning").length,
      data: items,
    });
  } catch (error: any) {
    console.error("[GET /api/maintenance] Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Error al obtener mantenimientos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectName, clientName, cycleDays, notes } = body;

    await logActivity({
      action: `Programado mantenimiento para ${projectName}`,
      entityType: "maintenance",
      entityId: projectName,
      details: { clientName, cycleDays, notes },
      source: "web",
    });

    return NextResponse.json({ success: true, message: "Mantenimiento registrado con éxito" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
