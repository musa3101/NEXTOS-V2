import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { renderToFile } from "@react-pdf/renderer";
import React from "react";
import { test, expect } from "vitest";
import { InvoiceTemplate } from "@/lib/pdf/invoice-template";
import { ProposalTemplate } from "@/lib/pdf/proposal-template";
import { DeliveryTemplate } from "@/lib/pdf/delivery-template";

const OUT_DIR = "/Users/musa/.gemini/antigravity-ide/brain/3b16058e-4c14-43c1-8981-4e2bf26fa248";
const SCRATCH_DIR = path.join(OUT_DIR, "scratch");

test("renders new authentic MyNext PDF templates and creates PNG previews", async () => {
  // 1. Invoice
  const invoiceData = {
    number: "03",
    date: "19/09/2026",
    dueDate: "03/10/2026",
    client: {
      name: "Goyo",
      company: "Ecuaplac S.L.",
      email: "ecuaplac.jyg.sl@gmail.com",
      phone: "+34 678 15 98 78",
      address: "Palma de Mallorca",
    },
    items: [
      { description: "Plan Élite web Ecuaplac", quantity: 1, unitPrice: 350 },
      { description: "Dominio+ Gestión", quantity: 1, unitPrice: 30 },
      { description: "Bakend (control de web)", quantity: 1, unitPrice: 20 },
    ],
    taxRate: 0,
  };

  const invPdf = path.join(SCRATCH_DIR, "invoice_real.pdf");
  await renderToFile(React.createElement(InvoiceTemplate, { data: invoiceData }) as any, invPdf);
  expect(fs.existsSync(invPdf)).toBe(true);

  // 2. Proposal
  const proposalData = {
    businessName: "Shopisafer",
    clientName: "Camila",
    demoUrl: "https://shopisafer.pages.dev",
    adminUrl: "https://shopisafer.pages.dev/admin",
    introMessage:
      "Te comparto este primer prototipo interactivo para Shopisafer. He desarrollado esta propuesta enfocándome en dos pilares fundamentales:",
    features: [
      "Experiencia de USUARIO y diseño visual: Una interfaz limpia, moderna e intuitiva pensada para aumentar las ventas y elevar la imagen de la marca.",
      "Gestión rápida e intuitiva: Un panel PARA TI de administración optimizado para que puedas controlar productos, pedidos y métricas de forma ágil y sencilla.",
    ],
    closingMessage:
      "Te lo envío hoy para que puedas echarle un ojo tranquilamente y navegar por la propuesta. Mañana a las 18:00h en nuestra llamada lo comentamos a fondo y resolvemos cualquier detalle. Si te surge alguna pregunta antes de la cita, ¡escríbeme sin problema!",
  };

  const propPdf = path.join(SCRATCH_DIR, "proposal_real.pdf");
  await renderToFile(React.createElement(ProposalTemplate, { data: proposalData }) as any, propPdf);
  expect(fs.existsSync(propPdf)).toBe(true);

  // 3. Delivery
  const deliveryData = {
    client: {
      name: "Goyo",
      company: "Ecuaplac",
    },
    project: {
      name: "Ecuaplac Web",
      demoUrl: "https://ecuaplac.com",
    },
    summary:
      "He mejorado la web implementando nuevas características para que quede perfecta. Te detallo los cambios rápidamente:",
    deliverables: [
      "El logo del encabezado ahora tiene animación de entrada y la pantalla de carga es nueva.",
      "He cambiado las fotos del inicio por unas mucho más atractivas de reformas en Mallorca.",
      "He mejorado el carrusel de proyectos para que la galería luzca impecable.",
      "¡He rediseñado la sección de 'Nuestra Experiencia' por completo!",
      "He añadido una nueva sección de Preguntas Frecuentes al final de Contacto.",
      "He unificado todos los contactos de Ecuaplac: formulario directo a Gmail, WhatsApp y correo.",
      "Optimización SEO local para que Ecuaplac posicione primero en Google cuando la lancemos.",
      "Panel de gestión (backend) para cambiar textos o fotos de forma súper fácil.",
    ],
    closingMessage:
      'Te sugiero que le des un vistazo a la web y me comentes cualquier detalle que quieras ajustar. Si todo te parece bien, dame el "OK" para comprar el dominio ¡y la lanzamos!',
  };

  const delPdf = path.join(SCRATCH_DIR, "delivery_real.pdf");
  await renderToFile(React.createElement(DeliveryTemplate, { data: deliveryData }) as any, delPdf);
  expect(fs.existsSync(delPdf)).toBe(true);

  // Generate PNG previews with qlmanage
  execSync(`qlmanage -t -s 1200 -o "${OUT_DIR}" "${invPdf}" "${propPdf}" "${delPdf}"`, { stdio: "inherit" });
});
