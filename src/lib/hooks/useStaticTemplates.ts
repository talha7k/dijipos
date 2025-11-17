import { useMemo } from 'react';
import { InvoiceTemplate, ReceiptTemplate } from '@/types';
import { InvoiceTemplateType, ReceiptTemplateType } from '@/types/enums';

// Import static templates
import { salesInvoiceEnglish } from '@/components/templates/invoice/sales-invoice-english';
import { salesInvoiceArabic } from '@/components/templates/invoice/sales-invoice-arabic';
import { purchaseInvoiceEnglish } from '@/components/templates/invoice/purchase-invoice-english';
import { purchaseInvoiceArabic } from '@/components/templates/invoice/purchase-invoice-arabic';
import { defaultEnglishReceiptTemplate } from '@/components/templates/receipt/default-receipt-thermal-english';
import { defaultArabicReceiptTemplate } from '@/components/templates/receipt/default-receipt-thermal-arabic';
import { defaultReceiptA4Template } from '@/components/templates/receipt/default-receipt-a4-english';
import { defaultArabicReceiptA4Template } from '@/components/templates/receipt/default-receipt-a4-arabic';
import { posReportThermal } from '@/components/templates/reports/pos-report-thermal';
import { posReportA4 } from '@/components/templates/reports/pos-report-a4';
import { shortPosReportThermal } from '@/components/templates/reports/short-pos-report-thermal';
import { shortPosReportA4 } from '@/components/templates/reports/short-pos-report-a4';
import { invoiceReportThermal } from '@/components/templates/reports/invoice-report-thermal';
import { invoiceReportA4 } from '@/components/templates/reports/invoice-report-a4';
import { shortInvoiceReportThermal } from '@/components/templates/reports/short-invoice-report-thermal';
import { shortInvoiceReportA4 } from '@/components/templates/reports/short-invoice-report-a4';

const staticInvoiceTemplates: Omit<InvoiceTemplate, 'organizationId' | 'createdAt' | 'updatedAt'>[] = [
  // Sales Invoices
  {
    id: 'sales-invoice-english',
    name: 'Default Sales Invoice (English)',
    type: InvoiceTemplateType.ENGLISH,
    content: salesInvoiceEnglish,
    fields: [],
    style: {
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Arial",
      fontSize: 12,
      showLogo: true,
      showWatermark: false,
    }
  },
  {
    id: 'sales-invoice-arabic',
    name: 'Default Sales Invoice (Arabic)',
    type: InvoiceTemplateType.ARABIC,
    content: salesInvoiceArabic,
    fields: [],
    style: {
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Arial",
      fontSize: 12,
      showLogo: true,
      showWatermark: false,
    }
  },
  {
    id: 'purchase-invoice-english',
    name: 'Default Purchase Invoice (English)',
    type: InvoiceTemplateType.ENGLISH,
    content: purchaseInvoiceEnglish,
    fields: [],
    style: {
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Arial",
      fontSize: 12,
      showLogo: true,
      showWatermark: false,
    }
  },
  {
    id: 'purchase-invoice-arabic',
    name: 'Default Purchase Invoice (Arabic)',
    type: InvoiceTemplateType.ARABIC,
    content: purchaseInvoiceArabic,
    fields: [],
    style: {
      primaryColor: "#000000",
      secondaryColor: "#666666",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontFamily: "Arial",
      fontSize: 12,
      showLogo: true,
      showWatermark: false,
    }
  },
];

const staticReceiptTemplates: Omit<ReceiptTemplate, 'organizationId' | 'createdAt' | 'updatedAt'>[] = [
  // Receipts
  { id: 'default-receipt-thermal-english', name: 'Default Thermal Receipt (English)', type: ReceiptTemplateType.ENGLISH_THERMAL, content: defaultEnglishReceiptTemplate },
  { id: 'default-receipt-thermal-arabic', name: 'Default Thermal Receipt (Arabic)', type: ReceiptTemplateType.ARABIC_THERMAL, content: defaultArabicReceiptTemplate },
  { id: 'default-receipt-a4-english', name: 'Default A4 Receipt (English)', type: ReceiptTemplateType.ENGLISH_A4, content: defaultReceiptA4Template },
  { id: 'default-receipt-a4-arabic', name: 'Default A4 Receipt (Arabic)', type: ReceiptTemplateType.ARABIC_A4, content: defaultArabicReceiptA4Template },
];

const staticReportTemplates = [
  // Reports
  { id: 'pos-report-thermal', name: 'POS Report (Thermal)', type: 'report', content: posReportThermal },
  { id: 'pos-report-a4', name: 'POS Report (A4)', type: 'report', content: posReportA4 },
  { id: 'short-pos-report-thermal', name: 'Short POS Report (Thermal)', type: 'report', content: shortPosReportThermal },
  { id: 'short-pos-report-a4', name: 'Short POS Report (A4)', type: 'report', content: shortPosReportA4 },
  { id: 'invoice-report-thermal', name: 'Invoice Report (Thermal)', type: 'report', content: invoiceReportThermal },
  { id: 'invoice-report-a4', name: 'Invoice Report (A4)', type: 'report', content: invoiceReportA4 },
  { id: 'short-invoice-report-thermal', name: 'Short Invoice Report (Thermal)', type: 'report', content: shortInvoiceReportThermal },
  { id: 'short-invoice-report-a4', name: 'Short Invoice Report (A4)', type: 'report', content: shortInvoiceReportA4 },
];

export function useStaticTemplates() {
  const invoiceTemplates = useMemo(() => {
    return staticInvoiceTemplates.map(t => ({
      ...t,
      organizationId: 'static',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false, // Add isDefault property for compatibility
    })) as InvoiceTemplate[];
  }, []);

  const receiptTemplates = useMemo(() => {
    return staticReceiptTemplates.map(t => ({
      ...t,
      organizationId: 'static',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false, // Add isDefault property for compatibility
    })) as ReceiptTemplate[];
  }, []);

  const reportTemplates = useMemo(() => staticReportTemplates, []);

  return {
    allTemplates: [...invoiceTemplates, ...receiptTemplates, ...reportTemplates],
    invoiceTemplates,
    receiptTemplates,
    reportTemplates,
    loading: false,
    error: null,
  };
}
