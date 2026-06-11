import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateInvoicePdf, generateDeliveryPdf, generateProposalPdf } from "@/lib/pdf/generate";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { data, error } = await supabaseAdmin
      .from("documents")
      .select("*, clients(name, company), projects(name)")
      .eq("id", resolvedParams.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const doc = data as any;
    let pdfBuffer: Buffer;

    await logActivity({
      action: "downloaded",
      entityType: "document",
      entityId: doc.id,
      details: { number: doc.number },
    });

    if (doc.type === "invoice") {
      pdfBuffer = await generateInvoicePdf({
        number: doc.number,
        date: new Date(doc.created_at || Date.now()).toLocaleDateString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        client: {
          name: doc.clients?.name || "",
          company: doc.clients?.company || "",
          address: doc.template_data?.clientAddress || "",
        },
        items: doc.template_data?.items || [],
        taxRate: doc.template_data?.taxRate || 21,
      });
    } else if (doc.type === "delivery") {
      if (doc.template_data?.is_proposal) {
        pdfBuffer = await generateProposalPdf({
          businessName: doc.template_data?.clientName || doc.template_data?.businessName || doc.clients?.company || doc.clients?.name || "Negocio",
          demoUrl: doc.template_data?.demoUrl || "https://mynext.dev",
          number: doc.number,
          date: new Date(doc.created_at || Date.now()).toLocaleDateString("es-ES"),
        });
      } else {
        pdfBuffer = await generateDeliveryPdf({
          number: doc.number,
          date: new Date(doc.created_at || Date.now()).toLocaleDateString(),
          client: {
            name: doc.clients?.name || "",
            company: doc.clients?.company || "",
          },
          project: {
            name: doc.projects?.name || "Proyecto",
          },
          summary: doc.template_data?.summary || "",
          stack: doc.template_data?.stack || [],
          deliverables: doc.template_data?.deliverables || [],
          credentials: doc.template_data?.credentials || [],
        });
      }
    } else {
      return new NextResponse("Invalid document type", { status: 400 });
    }

    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${doc.number}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Error generating PDF:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
