import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './shared-styles';

export interface DeliveryData {
  number: string;
  date: string;
  client: {
    name: string;
    company: string;
  };
  project: {
    name: string;
  };
  summary: string;
  stack: string[];
  deliverables: string[];
  credentials: {
    service: string;
    url?: string;
    username: string;
    password?: string;
  }[];
}

export const DeliveryTemplate = ({ data }: { data: DeliveryData }) => {
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

        <Text style={styles.title}>ENTREGA DE PROYECTO</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.client.company || data.client.name}</Text>
            <Text style={styles.value}>{data.client.name}</Text>
            
            <Text style={[styles.label, { marginTop: 10 }]}>Proyecto:</Text>
            <Text style={styles.value}>{data.project.name}</Text>
          </View>
          
          <View style={styles.col}>
            <Text style={styles.label}>Documento N°:</Text>
            <Text style={styles.value}>{data.number}</Text>
            
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>{data.date}</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.label}>Resumen del Proyecto</Text>
          <Text style={styles.value}>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Stack Tecnológico</Text>
          {data.stack.map((tech, i) => (
            <Text key={i} style={styles.value}>• {tech}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Entregables</Text>
          {data.deliverables.map((item, i) => (
            <Text key={i} style={styles.value}>• {item}</Text>
          ))}
        </View>

        {data.credentials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Credenciales de Acceso</Text>
            <View style={[styles.table, { marginTop: 10 }]}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: '30%' }]}>Servicio</Text>
                <Text style={[styles.tableHeaderText, { width: '35%' }]}>Usuario/URL</Text>
                <Text style={[styles.tableHeaderText, { width: '35%' }]}>Nota/Password</Text>
              </View>
              {data.credentials.map((cred, i) => (
                <View style={styles.tableRow} key={i}>
                  <Text style={[styles.tableCellText, { width: '30%' }]}>{cred.service}</Text>
                  <Text style={[styles.tableCellText, { width: '35%' }]}>{cred.username} {cred.url ? `\n(${cred.url})` : ''}</Text>
                  <Text style={[styles.tableCellText, { width: '35%' }]}>{cred.password || 'Proporcionado por vía segura'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Este documento confirma la entrega de los servicios descritos según el acuerdo de proyecto.
            El mantenimiento y soporte aplicará según lo estipulado en el contrato original.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
