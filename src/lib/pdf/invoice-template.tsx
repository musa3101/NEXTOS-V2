import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getLogoBlackSource } from './assets';

export interface InvoiceData {
  number: string;
  date?: string;
  dueDate?: string;
  client: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
  taxRate?: number; // e.g. 21 for 21%
}

const invoiceStyles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 38,
    backgroundColor: '#F8F7F4',
    fontFamily: 'Helvetica',
    color: '#000000',
    justifyContent: 'space-between',
  },
  // Top Header Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  titleText: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    marginBottom: 4,
    color: '#000000',
  },
  numberPill: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  numberText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  logoBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logoAccent: {
    color: '#C8A86B',
  },

  // Client & Company Box
  infoBox: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 10,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  infoColLeft: {
    flex: 1,
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  infoColRight: {
    flex: 1,
    paddingLeft: 14,
    alignItems: 'flex-end',
  },
  sectionTitleLeft: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
    color: '#000000',
    textAlign: 'left',
  },
  sectionTitleRight: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 6,
    color: '#000000',
    textAlign: 'right',
  },
  infoTextBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 9,
    color: '#111111',
    lineHeight: 1.3,
    marginBottom: 1,
  },

  // Line Items Table
  tableContainer: {
    marginBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 9,
    color: '#111111',
  },
  colDetalle: {
    flex: 3.2,
    textAlign: 'left',
  },
  colCantidad: {
    flex: 1,
    textAlign: 'center',
  },
  colPrecio: {
    flex: 1,
    textAlign: 'center',
  },
  colTotal: {
    flex: 1,
    textAlign: 'right',
  },
  dividerLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    marginTop: 2,
    marginBottom: 8,
  },

  // Total Bar
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  totalBox: {
    backgroundColor: '#000000',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 18,
    width: 180,
  },
  totalLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
  },

  // Payment & Thank You Row
  bottomCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 14,
    gap: 14,
  },
  paymentBox: {
    flex: 1.25,
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  paymentTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 4,
    color: '#000000',
  },
  paymentText: {
    fontSize: 8,
    color: '#222222',
    lineHeight: 1.3,
    marginBottom: 1.5,
  },
  paymentTextBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
  },
  ibanText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  thankYouBox: {
    flex: 0.95,
    backgroundColor: '#000000',
    borderRadius: 3,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouWhite: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 1.35,
  },
  thankYouGold: {
    fontSize: 12.5,
    fontFamily: 'Helvetica-Bold',
    color: '#C8A86B',
    letterSpacing: 2,
    textAlign: 'center',
    marginTop: 2,
  },

  // Footer Monogram & Pill
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  monogramImage: {
    width: 50,
    height: 50,
    marginBottom: 6,
  },
  webPill: {
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  webPillText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.2,
    color: '#000000',
  },
});

export const InvoiceTemplate = ({ data }: { data: InvoiceData }) => {
  const items = data.items && data.items.length > 0 ? data.items : [];
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity || 1) * Number(item.unitPrice || 0)),
    0
  );
  const taxRate = typeof data.taxRate === 'number' ? data.taxRate : 0;
  const total = subtotal + (subtotal * taxRate) / 100;

  const clientTitle = data.client?.company || data.client?.name || 'Cliente';
  const clientName = data.client?.name && data.client?.name !== data.client?.company ? data.client.name : undefined;

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
            <Text style={invoiceStyles.logoText}>
              MY<Text style={invoiceStyles.logoAccent}>NEXT</Text>
            </Text>
          </View>
        </View>

        {/* Client & Company Card */}
        <View style={invoiceStyles.infoBox}>
          <View style={invoiceStyles.infoColLeft}>
            <Text style={invoiceStyles.sectionTitleLeft}>DATOS DEL CLIENTE</Text>
            <Text style={invoiceStyles.infoTextBold}>{clientTitle}</Text>
            {clientName && <Text style={invoiceStyles.infoText}>{clientName}</Text>}
            {data.client?.email && <Text style={invoiceStyles.infoText}>{data.client.email}</Text>}
            {data.client?.phone && <Text style={invoiceStyles.infoText}>{data.client.phone}</Text>}
            <Text style={invoiceStyles.infoText}>{data.client?.address || 'Palma de Mallorca'}</Text>
          </View>

          <View style={invoiceStyles.infoColRight}>
            <Text style={invoiceStyles.sectionTitleRight}>DATOS DE LA EMPRESA</Text>
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

          {items.map((item, index) => {
            const q = Number(item.quantity || 1);
            const p = Number(item.unitPrice || 0);
            const t = q * p;
            return (
              <View style={invoiceStyles.tableRow} key={index}>
                <Text style={[invoiceStyles.cellText, invoiceStyles.colDetalle]}>{item.description}</Text>
                <Text style={[invoiceStyles.cellText, invoiceStyles.colCantidad]}>
                  {String(q).padStart(2, '0')}
                </Text>
                <Text style={[invoiceStyles.cellText, invoiceStyles.colPrecio]}>{p}€</Text>
                <Text style={[invoiceStyles.cellText, invoiceStyles.colTotal]}>{t}€</Text>
              </View>
            );
          })}
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
            <Text style={invoiceStyles.paymentText}>
              <Text style={invoiceStyles.paymentTextBold}>Banco: </Text>Revolut
            </Text>
            <Text style={invoiceStyles.paymentText}>
              <Text style={invoiceStyles.paymentTextBold}>Nombre: </Text>Musa Abdul
            </Text>
            <Text style={invoiceStyles.paymentText}>
              <Text style={invoiceStyles.paymentTextBold}>Ref: </Text>{clientTitle} - Factura Nº {data.number}
            </Text>
            <Text style={invoiceStyles.ibanText}>ES3915830001159018860090</Text>
          </View>

          <View style={invoiceStyles.thankYouBox}>
            <Text style={invoiceStyles.thankYouWhite}>GRACIAS POR</Text>
            <Text style={invoiceStyles.thankYouWhite}>CONFIAR EN</Text>
            <Text style={invoiceStyles.thankYouGold}>MYNEXT</Text>
          </View>
        </View>

        {/* Footer Brand Mark & Pill */}
        <View style={invoiceStyles.footerContainer}>
          <Image src={getLogoBlackSource()} style={invoiceStyles.monogramImage} />
          <View style={invoiceStyles.webPill}>
            <Text style={invoiceStyles.webPillText}>WWW.MYNEXTBYMUSA.COM</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
