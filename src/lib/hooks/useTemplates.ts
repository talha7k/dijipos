import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { useReceiptTemplatesData } from './useReceiptTemplatesData';
import { useInvoicesTemplatesData } from './useInvoicesTemplatesData';
import { useQuotesTemplatesData } from './useQuotesTemplatesData';
import { usePrinterSettings } from './usePrinterSettings';

interface TemplatesState {
  receiptTemplates: ReceiptTemplate[];
  invoiceTemplates: InvoiceTemplate[];
  quoteTemplates: QuoteTemplate[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time templates for the selected organization
 */
export function useTemplates(): TemplatesState {
  const { selectedOrganization } = useOrganization();
  const { printerSettings } = usePrinterSettings();

  const organizationId = selectedOrganization?.id || null;

  const {
    data: firestoreReceiptTemplates,
    loading: receiptLoading,
    error: receiptError
  } = useRealtimeCollection<ReceiptTemplate>('receiptTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  const {
    data: firestoreInvoiceTemplates,
    loading: invoiceLoading,
    error: invoiceError
  } = useRealtimeCollection<InvoiceTemplate>('invoiceTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  const {
    data: firestoreQuoteTemplates,
    loading: quoteLoading,
    error: quoteError
  } = useRealtimeCollection<QuoteTemplate>('quoteTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  // Get static templates as fallback
  const { receiptTemplates: staticReceiptTemplates } = useReceiptTemplatesData(organizationId || undefined);
  const { templates: staticInvoiceTemplates } = useInvoicesTemplatesData(organizationId || undefined);
  const { templates: staticQuoteTemplates } = useQuotesTemplatesData(organizationId || undefined);

  // Combine Firestore templates with static templates
  // Firestore templates take precedence (no duplicates by ID)
  const receiptTemplates = [
    ...staticReceiptTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.receipts?.defaultTemplateId === template.id
    })),
    ...firestoreReceiptTemplates
      .filter(ft => !staticReceiptTemplates.some(st => st.id === ft.id))
      .map(template => ({
        ...template,
        isDefault: printerSettings?.receipts?.defaultTemplateId === template.id
      }))
  ];

  const invoiceTemplates = [
    ...staticInvoiceTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.invoices?.defaultTemplateId === template.id
    })),
    ...firestoreInvoiceTemplates
      .filter(ft => !staticInvoiceTemplates.some(st => st.id === ft.id))
      .map(template => ({
        ...template,
        isDefault: printerSettings?.invoices?.defaultTemplateId === template.id
      }))
  ];

  const quoteTemplates = [
    ...staticQuoteTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.quotes?.defaultTemplateId === template.id
    })),
    ...firestoreQuoteTemplates
      .filter(ft => !staticQuoteTemplates.some(st => st.id === ft.id))
      .map(template => ({
        ...template,
        isDefault: printerSettings?.quotes?.defaultTemplateId === template.id
      }))
  ];

  const loading = receiptLoading || invoiceLoading || quoteLoading;
  const error = receiptError || invoiceError || quoteError;

  return {
    receiptTemplates,
    invoiceTemplates: invoiceTemplates,
    quoteTemplates: quoteTemplates,
    loading,
    error,
  };
}