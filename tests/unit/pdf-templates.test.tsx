import { describe, it, expect } from "vitest";
import React from "react";
import { InvoiceTemplate, InvoiceData } from "@/lib/pdf/invoice-template";
import { DeliveryTemplate, DeliveryData } from "@/lib/pdf/delivery-template";

describe("PDF Templates (src/lib/pdf)", () => {
  describe("InvoiceTemplate", () => {
    const mockInvoice: InvoiceData = {
      number: "INV-2026-001",
      date: "2026-08-01",
      dueDate: "2026-08-15",
      client: {
        name: "Carlos Mendoza",
        company: "ECUAPLAC S.L.",
        email: "carlos@ecuaplac.com",
        phone: "+34 600 000 000",
        address: "Calle Mayor 12, Madrid",
      },
      items: [
        { description: "Desarrollo Web Next.js", quantity: 1, unitPrice: 1200 },
        { description: "Mantenimiento Cloudflare CDN", quantity: 2, unitPrice: 150 },
      ],
      taxRate: 21,
    };

    it("creates an InvoiceTemplate React element without throwing", () => {
      const element = <InvoiceTemplate data={mockInvoice} />;
      expect(element).toBeDefined();
      expect(element.props.data.number).toBe("INV-2026-001");
      expect(element.props.data.items).toHaveLength(2);
    });

    it("handles zero items without crashing", () => {
      const emptyInvoice: InvoiceData = {
        ...mockInvoice,
        items: [],
      };
      const element = <InvoiceTemplate data={emptyInvoice} />;
      expect(element).toBeDefined();
      expect(element.props.data.items).toHaveLength(0);
    });
  });

  describe("DeliveryTemplate", () => {
    const mockDelivery: DeliveryData = {
      number: "DEL-2026-001",
      date: "2026-08-01",
      client: {
        name: "Carlos Mendoza",
        company: "ECUAPLAC",
      },
      project: {
        name: "Ecuaplac Corporativa",
        demoUrl: "https://ecuaplac.com",
      },
      summary: "Despliegue final de la plataforma web corporativa.",
      stack: ["Next.js 16", "Cloudflare Pages", "Tailwind CSS v4"],
      deliverables: ["Código fuente", "Acceso DNS", "Guía de administración"],
      credentials: [
        {
          service: "Panel Admin",
          url: "https://ecuaplac.com/admin",
          username: "admin@ecuaplac.com",
          password: "SecurePassword123!",
        },
      ],
      language: "es",
    };

    it("creates a DeliveryTemplate React element in Spanish without throwing", () => {
      const element = <DeliveryTemplate data={mockDelivery} />;
      expect(element).toBeDefined();
      expect(element.props.data.language).toBe("es");
      expect(element.props.data.project.name).toBe("Ecuaplac Corporativa");
    });

    it("creates a DeliveryTemplate React element in English", () => {
      const englishDelivery: DeliveryData = {
        ...mockDelivery,
        language: "en",
      };
      const element = <DeliveryTemplate data={englishDelivery} />;
      expect(element).toBeDefined();
      expect(element.props.data.language).toBe("en");
    });
  });
});
