import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface InvoiceData {
  number: string;
  date: string;
  dueDate: string;
  client: {
    name: string;
    company: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate: number; // e.g., 21 for 21%
}

const invoiceStyles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: '#FAF8F5',
    fontFamily: 'Helvetica',
    color: '#000000',
  },
  // Top Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 34,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    marginBottom: 6,
    color: '#000000',
  },
  numberPill: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  numberText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  logoBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FAF8F5',
    letterSpacing: 2,
  },
  logoAccent: {
    color: '#D4A853',
  },

  // Client & Company Info Box
  infoBox: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    marginBottom: 22,
  },
  infoColLeft: {
    flex: 1,
    paddingRight: 12,
  },
  infoColRight: {
    flex: 1,
    paddingLeft: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: '#000000',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
    color: '#000000',
  },
  infoText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: '#1A1A1A',
  },
  infoTextBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.45,
    color: '#000000',
  },

  // Table
  tableContainer: {
    marginBottom: 16,
  },
  tableHeader: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  colDetalle: { width: '52%' },
  colCantidad: { width: '16%', textAlign: 'center' },
  colPrecio: { width: '16%', textAlign: 'right' },
  colTotal: { width: '16%', textAlign: 'right' },
  cellText: {
    fontSize: 10,
    color: '#111111',
  },
  dividerLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    marginVertical: 10,
  },

  // Total Bar
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  totalBox: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 250,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  totalAmount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },

  // Payment & Thank You Bottom Cards
  bottomCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  paymentBox: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 14,
    padding: 12,
    width: '56%',
  },
  paymentTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
    color: '#000000',
    textAlign: 'center',
  },
  paymentText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: '#111111',
  },
  paymentTextBold: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  thankYouBox: {
    backgroundColor: '#000000',
    borderRadius: 4,
    padding: 16,
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouText: {
    color: '#D4A853',
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 1.4,
    letterSpacing: 0.5,
  },

  // Footer Brand Mark
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
  },
  footerBrandMark: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    letterSpacing: 3,
    marginBottom: 6,
  },
  webPill: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  webPillText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: '#000000',
  },
});

export const InvoiceTemplate = ({ data }: { data: InvoiceData }) => {
  const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * (data.taxRate || 0)) / 100;
  const total = subtotal + taxAmount;

  return (
    <Document>
      <Page size="A4" style={invoiceStyles.page}>
        {/* Top Header */}
        <View style={invoiceStyles.headerRow}>
          <View style={invoiceStyles.titleContainer}>
            <Text style={invoiceStyles.titleText}>FACTURA</Text>
            <View style={invoiceStyles.numberPill}>
              <Text style={invoiceStyles.numberText}>Nº: {data.number || '01'}</Text>
            </View>
          </View>

          <View style={invoiceStyles.logoBadge}>
            <Text style={invoiceStyles.logoText}>MY<Text style={invoiceStyles.logoAccent}>NEXT</Text></Text>
          </View>
        </View>

        {/* Client & Company Card */}
        <View style={invoiceStyles.infoBox}>
          <View style={invoiceStyles.infoColLeft}>
            <Text style={invoiceStyles.sectionTitle}>DATOS DEL CLIENTE</Text>
            <Text style={invoiceStyles.infoTextBold}>{data.client.company || data.client.name}</Text>
            {data.client.name && data.client.name !== data.client.company && (
              <Text style={invoiceStyles.infoText}>{data.client.name}</Text>
            )}
            {data.client.email && <Text style={invoiceStyles.infoText}>{data.client.email}</Text>}
            {data.client.phone && <Text style={invoiceStyles.infoText}>{data.client.phone}</Text>}
            {data.client.address && <Text style={invoiceStyles.infoText}>{data.client.address}</Text>}
          </View>

          <View style={invoiceStyles.infoColRight}>
            <Text style={invoiceStyles.sectionTitle}>DATOS DE LA EMPRESA</Text>
            <Text style={invoiceStyles.infoTextBold}>Mynext</Text>
            <Text style={invoiceStyles.infoText}>Mynextbymusa@gmail.com</Text>
            <Text style={invoiceStyles.infoText}>+34673109486</Text>
            <Text style={invoiceStyles.infoText}>Palma de Mallorca</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={invoiceStyles.tableContainer}>
          <View style={invoiceStyles.tableHeader}>
            <Text style={[invoiceStyles.tableHeaderText, invoiceStyles.colDetalle]}>Detalle</Text>
            <Text style={[invoiceStyles.tableHeaderText, invoiceStyles.colCantidad]}>Cantidad</Text>
            <Text style={[invoiceStyles.tableHeaderText, invoiceStyles.colPrecio]}>Precio</Text>
            <Text style={[invoiceStyles.tableHeaderText, invoiceStyles.colTotal]}>Total</Text>
          </View>

          {data.items.map((item, index) => (
            <View style={invoiceStyles.tableRow} key={index}>
              <Text style={[invoiceStyles.cellText, invoiceStyles.colDetalle]}>{item.description}</Text>
              <Text style={[invoiceStyles.cellText, invoiceStyles.colCantidad]}>{String(item.quantity).padStart(2, '0')}</Text>
              <Text style={[invoiceStyles.cellText, invoiceStyles.colPrecio]}>{item.unitPrice}€</Text>
              <Text style={[invoiceStyles.cellText, invoiceStyles.colTotal]}>{(item.quantity * item.unitPrice)}€</Text>
            </View>
          ))}
        </View>

        <View style={invoiceStyles.dividerLine} />

        {/* Total Bar */}
        <View style={invoiceStyles.totalRow}>
          <View style={invoiceStyles.totalBox}>
            <Text style={invoiceStyles.totalLabel}>TOTAL</Text>
            <Text style={invoiceStyles.totalAmount}>{total.toFixed(0)} €</Text>
          </View>
        </View>

        {/* Payment Info & Thank You Boxes */}
        <View style={invoiceStyles.bottomCardsRow}>
          <View style={invoiceStyles.paymentBox}>
            <Text style={invoiceStyles.paymentTitle}>INFORMACIÓN DE PAGO</Text>
            <Text style={invoiceStyles.paymentText}><Text style={invoiceStyles.paymentTextBold}>Banco:</Text> Revolut</Text>
            <Text style={invoiceStyles.paymentText}><Text style={invoiceStyles.paymentTextBold}>Nombre:</Text> Musa Abdul</Text>
            <Text style={invoiceStyles.paymentText}>
              <Text style={invoiceStyles.paymentTextBold}>Ref:</Text> {data.client.company || data.client.name} - Factura N° {data.number}
            </Text>
            <Text style={invoiceStyles.paymentTextBold}>ES3915830001159018860090</Text>
          </View>

          <View style={invoiceStyles.thankYouBox}>
            <Text style={invoiceStyles.thankYouText}>GRACIAS POR CONFIAR EN MYNEXT</Text>
          </View>
        </View>

        {/* Footer Brand Mark & Pill */}
        <View style={invoiceStyles.footerContainer}>
          <Text style={invoiceStyles.footerBrandMark}>MN</Text>
          <View style={invoiceStyles.webPill}>
            <Text style={invoiceStyles.webPillText}>WWW.MYNEXTBYMUSA.COM</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
