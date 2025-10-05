import { useMemo } from 'react';
import { InvoiceTemplate } from '@/types';

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

const staticTemplates: Omit<InvoiceTemplate, 'organizationId' | 'createdAt' | 'updatedAt'>[] = [
  // Sales Invoices
  { id: 'sales-invoice-english', name: 'Default Sales Invoice (English)', type: 'sales-invoice-english', content: salesInvoiceEnglish },
  { id: 'sales-invoice-arabic', name: 'Default Sales Invoice (Arabic)', type: 'sales-invoice-arabic', content: salesInvoiceArabic },

  // Purchase Invoices
  { id: 'purchase-invoice-english', name: 'Default Purchase Invoice (English)', type: 'purchase-invoice-english', content: purchaseInvoiceEnglish },
  { id: 'purchase-invoice-arabic', name: 'Default Purchase Invoice (Arabic)', type: 'purchase-invoice-arabic', content: purchaseInvoiceArabic },

  // Receipts
  { id: 'default-receipt-thermal-english', name: 'Default Thermal Receipt (English)', type: 'receipt-english', content: defaultEnglishReceiptTemplate },
  { id: 'default-receipt-thermal-arabic', name: 'Default Thermal Receipt (Arabic)', type: 'receipt-arabic', content: defaultArabicReceiptTemplate },
  { id: 'default-receipt-a4-english', name: 'Default A4 Receipt (English)', type: 'receipt-english', content: defaultReceiptA4Template },
  { id: 'default-receipt-a4-arabic', name: 'Default A4 Receipt (Arabic)', type: 'receipt-arabic', content: defaultArabicReceiptA4Template },

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
  const templates = useMemo(() => {
    return staticTemplates.map(t => ({
      ...t,
      organizationId: 'static',
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as InvoiceTemplate[];
  }, []);

  const invoiceTemplates = useMemo(() => templates.filter(t => t.type.includes('invoice')), [templates]);
  const receiptTemplates = useMemo(() => templates.filter(t => t.type.includes('receipt')), [templates]);
  const reportTemplates = useMemo(() => templates.filter(t => t.type.includes('report')), [templates]);

  return {
    allTemplates: templates,
    invoiceTemplates,
    receiptTemplates,
    reportTemplates,
    loading: false,
    error: null,
  };
}
