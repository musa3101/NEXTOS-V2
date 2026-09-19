import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet, Image } from '@react-pdf/renderer';
import { getLogoDarkSource } from './assets';

export interface ProposalData {
  number?: string;
  date?: string;
  businessName: string;
  clientName?: string;
  demoUrl: string; // OBLIGATORIO para que el cliente pulse y acceda
  adminUrl?: string;
  introMessage?: string;
  features?: string[];
  closingMessage?: string;
}

const proposalStyles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 22,
    paddingHorizontal: 38,
    backgroundColor: '#09090B',
    fontFamily: 'Helvetica',
    color: '#FFFFFF',
    position: 'relative',
    justifyContent: 'space-between',
  },
  // Inset Gold Border Frame (como en el PDF real de MyNext)
  outerBorder: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
    borderColor: '#382F1D',
    pointerEvents: 'none',
  },

  // Header Banner
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    width: '100%',
  },
  sideLine: {
    width: 65,
    height: 1,
    backgroundColor: '#C5A059',
  },
  mainLogo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 4,
    marginHorizontal: 16,
    color: '#FFFFFF',
  },
  logoAccent: {
    color: '#C5A059',
  },
  subtitle: {
    fontSize: 8.5,
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
    fontSize: 17,
    fontFamily: 'Helvetica-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.55,
    textAlign: 'center',
    color: '#CCCCCC',
    marginBottom: 14,
    maxWidth: 460,
  },
  highlightBusiness: {
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
  },

  // CTA Demo Button
  ctaContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  ctaLabel: {
    fontSize: 9.5,
    color: '#CCCCCC',
    marginBottom: 6,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldButton: {
    backgroundColor: '#C5A059',
    borderRadius: 3,
    paddingVertical: 9,
    paddingHorizontal: 30,
    textDecoration: 'none',
    alignSelf: 'center',
  },
  goldButtonText: {
    fontSize: 10.5,
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
    paddingVertical: 9,
    paddingHorizontal: 22,
    textDecoration: 'none',
  },
  adminButtonText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#C5A059',
    letterSpacing: 1.5,
    textAlign: 'center',
  },

  // Feature Highlights List (opcional)
  featuresBox: {
    backgroundColor: '#121216',
    borderWidth: 1,
    borderColor: '#222228',
    borderRadius: 5,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginVertical: 8,
    width: '100%',
    maxWidth: 460,
  },
  featureItem: {
    fontSize: 9,
    lineHeight: 1.45,
    color: '#DDDDDD',
    marginBottom: 3,
  },
  bulletGold: {
    color: '#C5A059',
    fontFamily: 'Helvetica-Bold',
  },

  // Closing Note
  closingText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    textAlign: 'center',
    color: '#CCCCCC',
    marginTop: 10,
    maxWidth: 460,
  },
  thankYouText: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    color: '#C5A059',
    letterSpacing: 0.5,
    marginTop: 10,
  },

  // Footer Monogram & Made By
  footerContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  monogramWatermark: {
    width: 54,
    height: 54,
    marginBottom: 5,
  },
  goldLine: {
    width: 220,
    height: 1,
    backgroundColor: '#C5A059',
    marginBottom: 5,
  },
  madeByText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: '#888888',
    textTransform: 'uppercase',
  },
});

export const ProposalTemplate = ({ data }: { data: ProposalData }) => {
  const clientGreeting = data.clientName
    ? `¡Hola ${data.clientName}, es un placer saludarte!`
    : 'Hola, es un placer saludarte!';

  const demoUrl = data.demoUrl || 'https://www.mynextbymusa.com';

  const intro =
    data.introMessage ||
    `Te comparto este prototipo interactivo para ${data.businessName}. He preparado esta propuesta enfocada en optimizar la experiencia de usuario y elevar la imagen de tu marca al máximo nivel.`;

  const closing =
    data.closingMessage ||
    'Échale un vistazo con calma, pruébala bien y mírale todos los detalles. Si encuentras cualquier cosa que quieras cambiar, ajustar o añadir, avísame y lo modifico. ¡Espero que te guste mucho el resultado!';

  return (
    <Document>
      <Page size="A4" style={proposalStyles.page}>
        <View style={proposalStyles.outerBorder} />

        {/* Top Header */}
        <View style={proposalStyles.headerContainer}>
          <View style={proposalStyles.logoRow}>
            <View style={proposalStyles.sideLine} />
            <Text style={proposalStyles.mainLogo}>
              MY<Text style={proposalStyles.logoAccent}>NEXT</Text>
            </Text>
            <View style={proposalStyles.sideLine} />
          </View>
          <Text style={proposalStyles.subtitle}>PROJECT DELIVERY</Text>
        </View>

        {/* Main Content */}
        <View style={proposalStyles.contentSection}>
          <Text style={proposalStyles.greetingText}>{clientGreeting}</Text>

          <Text style={proposalStyles.bodyText}>
            {intro}
          </Text>

          {/* Gold Clickable CTA Button */}
          <View style={proposalStyles.ctaContainer}>
            <Text style={proposalStyles.ctaLabel}>Accede a la demo aquí:</Text>
            <View style={proposalStyles.buttonsRow}>
              <Link src={demoUrl} style={proposalStyles.goldButton}>
                <Text style={proposalStyles.goldButtonText}>TU WEB</Text>
              </Link>
              {data.adminUrl && (
                <Link src={data.adminUrl} style={proposalStyles.adminButton}>
                  <Text style={proposalStyles.adminButtonText}>PANEL ADMIN</Text>
                </Link>
              )}
            </View>
          </View>

          {/* Optional Feature Highlights */}
          {data.features && data.features.length > 0 && (
            <View style={proposalStyles.featuresBox}>
              {data.features.map((feat, i) => (
                <Text key={i} style={proposalStyles.featureItem}>
                  <Text style={proposalStyles.bulletGold}>• </Text>{feat}
                </Text>
              ))}
            </View>
          )}

          <Text style={proposalStyles.closingText}>{closing}</Text>

          <Text style={proposalStyles.thankYouText}>Gracias por confiar en MYNEXT.</Text>
        </View>

        {/* Footer Monogram */}
        <View style={proposalStyles.footerContainer}>
          <Image src={getLogoDarkSource()} style={proposalStyles.monogramWatermark} />
          <View style={proposalStyles.goldLine} />
          <Text style={proposalStyles.madeByText}>MADE BY MYNEXT</Text>
        </View>
      </Page>
    </Document>
  );
};
