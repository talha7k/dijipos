import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

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

  const organizationId = selectedOrganization?.id || null;

  const {
    data: receiptTemplates,
    loading: receiptLoading,
    error: receiptError
  } = useRealtimeCollection<ReceiptTemplate>('receiptTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  const {
    data: invoiceTemplates,
    loading: invoiceLoading,
    error: invoiceError
  } = useRealtimeCollection<InvoiceTemplate>('invoiceTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  const {
    data: quoteTemplates,
    loading: quoteLoading,
    error: quoteError
  } = useRealtimeCollection<QuoteTemplate>('quoteTemplates', organizationId, [], null); // Disable orderBy to prevent index errors

  const loading = receiptLoading || invoiceLoading || quoteLoading;
  const error = receiptError || invoiceError || quoteError;

  return {
    receiptTemplates,
    invoiceTemplates,
    quoteTemplates,
    loading,
    error,
  };
}