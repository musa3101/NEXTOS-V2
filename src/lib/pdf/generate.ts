import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { InvoiceTemplate, InvoiceData } from './invoice-template';
import { DeliveryTemplate, DeliveryData } from './delivery-template';
import { ProposalTemplate, ProposalData } from './proposal-template';

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const element = React.createElement(InvoiceTemplate, { data });
  return await renderToBuffer(element as any);
}

export async function generateDeliveryPdf(data: DeliveryData): Promise<Buffer> {
  const element = React.createElement(DeliveryTemplate, { data });
  return await renderToBuffer(element as any);
}

export async function generateProposalPdf(data: ProposalData): Promise<Buffer> {
  const element = React.createElement(ProposalTemplate, { data });
  return await renderToBuffer(element as any);
}
