import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

export interface DeliveryData {
  number: string;
  date: string;
  client: {
    name: string;
    company: string;
  };
  project: {
    name: string;
    demoUrl?: string;
  };
  summary?: string;
  stack?: string[];
  deliverables?: string[];
  credentials?: {
    service: string;
    url?: string;
    username: string;
    password?: string;
  }[];
  language?: 'es' | 'en';
}

const deliveryStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#0C0C0E',
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
  },
  // Top Header Banner
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: 'relative',
  },
  sideLineLeft: {
    position: 'absolute',
    left: 0,
    top: 20,
    width: 60,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4A853',
  },
  sideLineRight: {
    position: 'absolute',
    right: 0,
    top: 20,
    width: 60,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D4A853',
  },
  mainLogo: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: '#D4A853',
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // Greeting & Letter Body
  greetingText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 16,
    marginTop: 10,
  },
  bodyParagraph: {
    fontSize: 11,
    lineHeight: 1.6,
    textAlign: 'center',
    color: '#DDDDDD',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  businessName: {
    fontFamily: 'Helvetica-Bold',
    color: '#D4A853',
  },

  // Gold CTA Button
  ctaContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  ctaLabel: {
    fontSize: 9,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: '#D4A853',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Content Box
  detailsSection: {
    backgroundColor: '#141419',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#D4A853',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#CCCCCC',
  },

  // Closing Note
  closingText: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: 'center',
    color: '#CCCCCC',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  thankYouTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#D4A853',
    marginVertical: 14,
  },

  // Footer Logo Mark
  footerContainer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
  },
  brandMark: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: '#22222a',
    letterSpacing: 2,
    marginBottom: 10,
  },
  bottomLine: {
    width: 280,
    borderBottomWidth: 1,
    borderBottomColor: '#D4A853',
    marginBottom: 8,
  },
  madeByText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: '#888888',
    textTransform: 'uppercase',
  },
});

export const DeliveryTemplate = ({ data }: { data: DeliveryData }) => {
  const isEn = data.language === 'en';
  const clientName = data.client.company || data.client.name || 'Cliente';
  const demoUrl = data.project?.demoUrl || (data.credentials && data.credentials[0]?.url) || 'https://www.mynextbymusa.com';

  return (
    <Document>
      <Page size="A4" style={deliveryStyles.page}>
        {/* Top Header Banner */}
        <View style={deliveryStyles.headerContainer}>
          <View style={deliveryStyles.sideLineLeft} />
          <Text style={deliveryStyles.mainLogo}>MYNEXT</Text>
          <Text style={deliveryStyles.subtitle}>PROJECT DELIVERY</Text>
          <View style={deliveryStyles.sideLineRight} />
        </View>

        {/* Greeting */}
        <Text style={deliveryStyles.greetingText}>
          {isEn ? "Hello, it's a pleasure to greet you!" : "Hola, es un placer saludarte!"}
        </Text>

        {/* Intro Copy */}
        <Text style={deliveryStyles.bodyParagraph}>
          {isEn
            ? `I'm passionate about seeing local businesses grow and, after exploring a bit about your wonderful company and its values, I felt inspired. With no obligation, I've prepared this preview of how your online presence could look, so you can see the potential of MYNEXT for `
            : `Me apasiona ver crecer a los negocios locales y, tras explorar un poco sobre tu maravillosa empresa y sus valores, me sentí inspirado. Sin ningún compromiso, he preparado esta previsualización de cómo podría lucir tu presencia online, para que veas el potencial de MYNEXT para `}
          <Text style={deliveryStyles.businessName}>{clientName}</Text>.
        </Text>

        {/* Gold CTA Button */}
        <View style={deliveryStyles.ctaContainer}>
          <Text style={deliveryStyles.ctaLabel}>
            {isEn ? "Access the demo here 👇" : "Accede a la demo aquí 👇"}
          </Text>
          <Link src={demoUrl} style={deliveryStyles.ctaButton}>
            <Text style={deliveryStyles.ctaButtonText}>
              {isEn ? "CLICK HERE ✨" : "ACCEDER A LA DEMO ✨"}
            </Text>
          </Link>
        </View>

        {/* Summary or Technical Details if provided */}
        {data.summary && (
          <View style={deliveryStyles.detailsSection}>
            <Text style={deliveryStyles.sectionTitle}>
              {isEn ? "Project Summary & Scope" : "Resumen y Alcance del Proyecto"}
            </Text>
            <Text style={deliveryStyles.detailText}>{data.summary}</Text>
          </View>
        )}

        {/* Closing Note */}
        <Text style={deliveryStyles.closingText}>
          {isEn
            ? "Please review the content and technical details. I look forward to your feedback to proceed with the final adjustments and definitive delivery once completed the process."
            : "Por favor, revisa el contenido y los detalles técnicos. Quedo a la espera de tus comentarios para proceder con los ajustes finales y la entrega definitiva una vez completado el proceso administrativo."}
        </Text>

        <Text style={deliveryStyles.thankYouTitle}>
          {isEn ? "Thank you for trusting MYNEXT." : "Gracias por confiar en MYNEXT."}
        </Text>

        {/* Footer Brand Mark */}
        <View style={deliveryStyles.footerContainer}>
          <Text style={deliveryStyles.brandMark}>MN</Text>
          <View style={deliveryStyles.bottomLine} />
          <Text style={deliveryStyles.madeByText}>MADE BY MYNEXT</Text>
        </View>
      </Page>
    </Document>
  );
};
