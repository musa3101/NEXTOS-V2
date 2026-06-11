import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './shared-styles';

export interface InvoiceData {
  number: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    company: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number; // e.g., 21 for 21%
}

export const InvoiceTemplate = ({ data }: { data: InvoiceData }) => {
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>MY<Text style={styles.logoAccent}>NEXT</Text></Text>
          </View>
          <View style={styles.companyDetails}>
            <Text>MyNext Software Solutions</Text>
            <Text>info@mynext.dev</Text>
            <Text>www.mynext.dev</Text>
          </View>
        </View>

        {/* Title & Info */}
        <Text style={styles.title}>FACTURA</Text>
        
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Facturar a:</Text>
            <Text style={styles.value}>{data.client.company || data.client.name}</Text>
            <Text style={styles.value}>{data.client.name}</Text>
            {data.client.address && <Text style={styles.value}>{data.client.address}</Text>}
          </View>
          
          <View style={styles.col}>
            <Text style={styles.label}>Número de Factura:</Text>
            <Text style={styles.value}>{data.number}</Text>
            
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{data.date}</Text>
            
            <Text style={styles.label}>Fecha de Vencimiento:</Text>
            <Text style={styles.value}>{data.dueDate}</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Descripción</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Cantidad</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Precio Unit.</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Total</Text>
          </View>

          {data.items.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCellText, styles.col1]}>{item.description}</Text>
              <Text style={[styles.tableCellText, styles.col2]}>{item.quantity}</Text>
              <Text style={[styles.tableCellText, styles.col3]}>€{item.unitPrice.toFixed(2)}</Text>
              <Text style={[styles.tableCellText, styles.col4]}>€{(item.quantity * item.unitPrice).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>€{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA ({data.taxRate}%):</Text>
              <Text style={styles.totalValue}>€{taxAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL:</Text>
              <Text style={styles.grandTotalValue}>€{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Términos de Pago: El pago debe realizarse dentro de los {data.dueDate ? 'días' : '30 días'} acordados.
          </Text>
          <Text style={styles.footerText}>
            Transferencia Bancaria: ES12 3456 7890 1234 5678 (Banco Ejemplo)
          </Text>
          <Text style={styles.footerText}>
            Gracias por confiar en MyNext.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
