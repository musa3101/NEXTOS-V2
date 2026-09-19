import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet, Image } from '@react-pdf/renderer';
import { getLogoDarkSource } from './assets';

export interface DeliveryData {
  number?: string;
  date?: string;
  client: {
    name: string;
    company?: string;
  };
  project: {
    name: string;
    demoUrl?: string;
    adminUrl?: string;
  };
  summary?: string;
  stack?: string[];
  deliverables?: string[];
  credentials?: Array<{
    service: string;
    url?: string;
    username: string;
    password?: string;
  }>;
  closingMessage?: string;
  language?: 'es' | 'en';
}

const deliveryStyles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 38,
    backgroundColor: '#09090B',
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
    position: 'relative',
    justifyContent: 'space-between',
  },
  // Inset Gold Frame
  outerBorder: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderColor: '#382F1D',
    pointerEvents: 'none',
  },

  // Header Banner
  headerContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    width: '100%',
  },
  sideLine: {
    width: 60,
    height: 1,
    backgroundColor: '#C5A059',
  },
  mainLogo: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    marginHorizontal: 14,
    color: '#FFFFFF',
  },
  logoAccent: {
    color: '#C5A059',
  },
  subtitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },

  // Main Content Section
  contentSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 'auto',
  },
  greetingText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    textAlign: 'center',
    color: '#CCCCCC',
    marginBottom: 8,
    maxWidth: 480,
  },
  projectNameHighlight: {
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
  },

  // CTA Demo Button
  ctaContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  ctaLabel: {
    fontSize: 9,
    color: '#CCCCCC',
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldButton: {
    backgroundColor: '#C5A059',
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 30,
    textDecoration: 'none',
    alignSelf: 'center',
  },
  goldButtonText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  adminButton: {
    backgroundColor: '#1E1E24',
    borderWidth: 1,
    borderColor: '#C5A059',
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 20,
    textDecoration: 'none',
  },
  adminButtonText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // Deliverables / Technical Scope List
  deliverablesBox: {
    backgroundColor: '#111115',
    borderWidth: 1,
    borderColor: '#222228',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 6,
    width: '100%',
    maxWidth: 480,
  },
  deliverablesTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deliverableItem: {
    fontSize: 8,
    lineHeight: 1.35,
    color: '#DDDDDD',
    marginBottom: 2.5,
  },
  bulletGold: {
    color: '#C5A059',
    fontFamily: 'Helvetica-Bold',
  },

  // Closing Note
  closingText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    textAlign: 'center',
    color: '#CCCCCC',
    marginTop: 6,
    maxWidth: 480,
  },
  thankYouText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#C5A059',
    letterSpacing: 0.5,
    marginTop: 6,
  },

  // Footer Monogram & Made By
  footerContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  monogramWatermark: {
    width: 48,
    height: 48,
    marginBottom: 4,
  },
  goldLine: {
    width: 220,
    height: 1,
    backgroundColor: '#C5A059',
    marginBottom: 4,
  },
  madeByText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: '#888888',
    textTransform: 'uppercase',
  },
});

export const DeliveryTemplate = ({ data }: { data: DeliveryData }) => {
  const clientName = data.client?.company || data.client?.name || 'Cliente';
  const projectName = data.project?.name || 'Proyecto Web';
  const demoUrl = data.project?.demoUrl || 'https://www.mynextbymusa.com';

  const intro =
    data.summary ||
    `Aquí tienes la web de ${projectName} terminada. He preparado el acceso directo para que puedas entrar, navegar y ver cómo ha quedado todo el diseño final en tiempo real.`;

  const closing =
    data.closingMessage ||
    `${projectName} ya está oficialmente en línea. Échale un vistazo con calma, pruébala bien y mírale todos los detalles. Si encuentras cualquier cosa que quieras cambiar, ajustar o añadir, avísame y lo modifico. ¡Espero que te guste mucho el resultado!`;

  return (
    <Document>
      <Page size="A4" style={deliveryStyles.page}>
        <View style={deliveryStyles.outerBorder} />

        {/* Top Header */}
        <View style={deliveryStyles.headerContainer}>
          <View style={deliveryStyles.logoRow}>
            <View style={deliveryStyles.sideLine} />
            <Text style={deliveryStyles.mainLogo}>
              MY<Text style={deliveryStyles.logoAccent}>NEXT</Text>
            </Text>
            <View style={deliveryStyles.sideLine} />
          </View>
          <Text style={deliveryStyles.subtitle}>PROJECT DELIVERY</Text>
        </View>

        {/* Main Content */}
        <View style={deliveryStyles.contentSection}>
          <Text style={deliveryStyles.greetingText}>
            Hola {clientName}, es un placer saludarte!
          </Text>

          <Text style={deliveryStyles.bodyText}>
            {intro}
          </Text>

          {/* Gold Clickable CTA Button */}
          <View style={deliveryStyles.ctaContainer}>
            <Text style={deliveryStyles.ctaLabel}>Accede a la web aquí:</Text>
            <View style={deliveryStyles.buttonsRow}>
              <Link src={demoUrl} style={deliveryStyles.goldButton}>
                <Text style={deliveryStyles.goldButtonText}>TU WEB</Text>
              </Link>
              {data.project?.adminUrl && (
                <Link src={data.project.adminUrl} style={deliveryStyles.adminButton}>
                  <Text style={deliveryStyles.adminButtonText}>PANEL ADMIN</Text>
                </Link>
              )}
            </View>
          </View>

          {/* Deliverables / Scope List */}
          {data.deliverables && data.deliverables.length > 0 && (
            <View style={deliveryStyles.deliverablesBox}>
              <Text style={deliveryStyles.deliverablesTitle}>Detalle de entregables completados</Text>
              {data.deliverables.map((item, i) => (
                <Text key={i} style={deliveryStyles.deliverableItem}>
                  <Text style={deliveryStyles.bulletGold}>• </Text>{item}
                </Text>
              ))}
            </View>
          )}

          <Text style={deliveryStyles.closingText}>{closing}</Text>

          <Text style={deliveryStyles.thankYouText}>Gracias por confiar en MYNEXT.</Text>
        </View>

        {/* Footer Monogram */}
        <View style={deliveryStyles.footerContainer}>
          <Image src={getLogoDarkSource()} style={deliveryStyles.monogramWatermark} />
          <View style={deliveryStyles.goldLine} />
          <Text style={deliveryStyles.madeByText}>MADE BY MYNEXT</Text>
        </View>
      </Page>
    </Document>
  );
};
