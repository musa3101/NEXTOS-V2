import { StyleSheet, Font } from '@react-pdf/renderer';

// We'll use default fonts or register standard ones if needed
// For now, using standard sans-serif

export const colors = {
  background: '#1A1A1A',
  text: '#FFFFFF',
  textSecondary: '#A3A3A3',
  primary: '#D4A853', // Gold
  border: '#333333',
  surface: '#262626',
};

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 2,
  },
  logoAccent: {
    color: colors.primary,
  },
  companyDetails: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 8,
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  tableHeaderText: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  tableCellText: {
    fontSize: 10,
    color: colors.text,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 10,
    color: colors.text,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  grandTotalLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  grandTotalValue: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 1.5,
  },
});
