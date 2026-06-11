import React from 'react';
import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer';
import { colors } from './shared-styles';

export interface ProposalData {
  businessName: string;
  demoUrl: string;
  number: string;
  date: string;
}

const localStyles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  logoAccent: {
    color: colors.primary,
  },
  companyDetails: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 1.4,
  },
  subtitle: {
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 3,
    marginBottom: 40,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.8,
    color: colors.text,
    marginBottom: 25,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 35,
  },
  buttonText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  button: {
    backgroundColor: colors.primary,
    color: '#000000',
    padding: '12 36',
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  signoff: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 30,
    marginBottom: 40,
  },
  monogramContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    opacity: 0.1,
  },
  monogramText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.textSecondary,
    letterSpacing: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export const ProposalTemplate = ({ data }: { data: ProposalData }) => {
  return (
    <Document>
      {/* PAGE 1: SPANISH */}
      <Page size="A4" style={localStyles.page}>
        {/* Header */}
        <View style={localStyles.header}>
          <View>
            <Text style={localStyles.logoText}>MY<Text style={localStyles.logoAccent}>NEXT</Text></Text>
          </View>
          <View style={localStyles.companyDetails}>
            <Text>MyNext Software Solutions</Text>
            <Text>info@mynext.dev</Text>
            <Text>www.mynext.dev</Text>
          </View>
        </View>

        <Text style={localStyles.subtitle}>PROJECT DELIVERY</Text>

        <Text style={localStyles.title}>Hola, es un placer saludarte!</Text>

        <Text style={localStyles.paragraph}>
          Me apasiona ver crecer a los negocios locales y, tras explorar un poco sobre tu maravillosa empresa y sus valores, me sentí inspirado.
        </Text>
        
        <Text style={localStyles.paragraph}>
          Sin ningún compromiso, he preparado esta previsualización de cómo podría lucir tu presencia online, para que veas el potencial de MYNEXT para <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{data.businessName}</Text>.
        </Text>

        <View style={localStyles.buttonContainer}>
          <Text style={localStyles.buttonText}>Accede a la demo aquí 👇</Text>
          <Link src={data.demoUrl} style={localStyles.button}>
            [ACCEDER A LA DEMO]
          </Link>
        </View>

        <Text style={localStyles.paragraph}>
          Por favor, revisa el contenido y los detalles técnicos. Quedo a la espera de tus comentarios para proceder con los ajustes finales y la entrega definitiva una vez completado el proceso administrativo.
        </Text>

        <Text style={localStyles.signoff}>Gracias por confiar en MYNEXT.</Text>

        {/* Monogram Watermark */}
        <View style={localStyles.monogramContainer}>
          <Text style={localStyles.monogramText}>MN</Text>
        </View>

        {/* Footer */}
        <View style={localStyles.footer}>
          <Text style={localStyles.footerText}>MADE BY MYNEXT</Text>
        </View>
      </Page>

      {/* PAGE 2: ENGLISH */}
      <Page size="A4" style={localStyles.page}>
        {/* Header */}
        <View style={localStyles.header}>
          <View>
            <Text style={localStyles.logoText}>MY<Text style={localStyles.logoAccent}>NEXT</Text></Text>
          </View>
          <View style={localStyles.companyDetails}>
            <Text>MyNext Software Solutions</Text>
            <Text>info@mynext.dev</Text>
            <Text>www.mynext.dev</Text>
          </View>
        </View>

        <Text style={localStyles.subtitle}>PROJECT DELIVERY</Text>

        <Text style={localStyles.title}>Hello, it's a pleasure to greet you!</Text>

        <Text style={localStyles.paragraph}>
          I'm passionate about seeing local businesses grow and, after exploring a bit about your wonderful company and its values, I felt inspired.
        </Text>
        
        <Text style={localStyles.paragraph}>
          With no obligation, I've prepared this preview of how your online presence could look, so you can see the potential of MYNEXT for <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{data.businessName}</Text>.
        </Text>

        <View style={localStyles.buttonContainer}>
          <Text style={localStyles.buttonText}>Access the demo here 👇</Text>
          <Link src={data.demoUrl} style={localStyles.button}>
            CLICK HERE
          </Link>
        </View>

        <Text style={localStyles.paragraph}>
          Please review the content and technical details. I look forward to your feedback to proceed with the final adjustments and definitive delivery once the administrative process is completed.
        </Text>

        <Text style={localStyles.signoff}>Thank you for trusting MYNEXT.</Text>

        {/* Monogram Watermark */}
        <View style={localStyles.monogramContainer}>
          <Text style={localStyles.monogramText}>MN</Text>
        </View>

        {/* Footer */}
        <View style={localStyles.footer}>
          <Text style={localStyles.footerText}>MADE BY MYNEXT</Text>
        </View>
      </Page>
    </Document>
  );
};
