import { useMemo } from 'react';
import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate, ReceiptTemplateType, InvoiceTemplateType, QuoteTemplateType } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { usePrinterSettings } from './usePrinterSettings';

// Static template IDs for easy reference
export const STATIC_RECEIPT_TEMPLATE_IDS = [
  'default-thermal',
  'arabic-thermal', 
  'default-a4',
  'arabic-a4'
];

export const STATIC_INVOICE_TEMPLATE_IDS = [
  'default-invoice',
  'arabic-invoice'
];

export const STATIC_QUOTE_TEMPLATE_IDS = [
  'default-quote',
  'arabic-quote'
];

interface SeparatedTemplatesState {
  // Static templates (always available, not in Firestore)
  staticReceiptTemplates: ReceiptTemplate[];
  staticInvoiceTemplates: InvoiceTemplate[];
  staticQuoteTemplates: QuoteTemplate[];
  
  // Custom templates (from Firestore)
  customReceiptTemplates: ReceiptTemplate[];
  customInvoiceTemplates: InvoiceTemplate[];
  customQuoteTemplates: QuoteTemplate[];
  
  // Combined templates for UI (static + custom)
  allReceiptTemplates: ReceiptTemplate[];
  allInvoiceTemplates: InvoiceTemplate[];
  allQuoteTemplates: QuoteTemplate[];
  
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides separated static and custom templates
 * Static templates are local-only, custom templates come from Firestore
 */
export function useSeparatedTemplates(): SeparatedTemplatesState {
  const { selectedOrganization } = useOrganization();
  const { printerSettings } = usePrinterSettings();
  
  const organizationId = selectedOrganization?.id || null;

  // Get custom templates from Firestore
  const {
    data: customReceiptTemplates,
    loading: receiptLoading,
    error: receiptError
  } = useRealtimeCollection<ReceiptTemplate>('receiptTemplates', organizationId, [], null);

  const {
    data: customInvoiceTemplates,
    loading: invoiceLoading,
    error: invoiceError
  } = useRealtimeCollection<InvoiceTemplate>('invoiceTemplates', organizationId, [], null);

  const {
    data: customQuoteTemplates,
    loading: quoteLoading,
    error: quoteError
  } = useRealtimeCollection<QuoteTemplate>('quoteTemplates', organizationId, [], null);

  // Get static templates (local only)
  const staticReceiptTemplates = useMemo(() => {
    if (!organizationId) return [];
    
    return [
      {
        id: 'default-thermal',
        name: 'Default Thermal Receipt',
        description: 'Default thermal printer receipt template in English',
        type: 'english_thermal' as ReceiptTemplateType,
        content: '', // Will be loaded from actual template files
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arabic-thermal',
        name: 'Arabic Thermal Receipt',
        description: 'Arabic thermal printer receipt template',
        type: 'arabic_thermal' as ReceiptTemplateType,
        content: '',
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'default-a4',
        name: 'Default A4 Receipt',
        description: 'Default A4 paper receipt template',
        type: 'english_a4' as ReceiptTemplateType,
        content: '',
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arabic-a4',
        name: 'Arabic A4 Receipt',
        description: 'Arabic A4 paper receipt template',
        type: 'arabic_a4' as ReceiptTemplateType,
        content: '',
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }, [organizationId]);

  const staticInvoiceTemplates = useMemo(() => {
    if (!organizationId) return [];
    
    return [
      {
        id: 'default-invoice',
        name: 'Default Invoice',
        description: 'Default invoice template',
        type: 'default' as InvoiceTemplateType,
        content: '',
        isDefault: false,
        fields: [],
        style: {
          primaryColor: '#000000',
          secondaryColor: '#666666',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arabic-invoice',
        name: 'Arabic Invoice',
        description: 'Arabic invoice template',
        type: 'arabic' as InvoiceTemplateType,
        content: '',
        isDefault: false,
        fields: [],
        style: {
          primaryColor: '#000000',
          secondaryColor: '#666666',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }, [organizationId]);

  const staticQuoteTemplates = useMemo(() => {
    if (!organizationId) return [];
    
    return [
      {
        id: 'default-quote',
        name: 'Default Quote',
        description: 'Default quote template',
        type: 'default' as QuoteTemplateType,
        content: '',
        isDefault: false,
        fields: [],
        style: {
          primaryColor: '#000000',
          secondaryColor: '#666666',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arabic-quote',
        name: 'Arabic Quote',
        description: 'Arabic quote template',
        type: 'arabic' as QuoteTemplateType,
        content: '',
        isDefault: false,
        fields: [],
        style: {
          primaryColor: '#000000',
          secondaryColor: '#666666',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }, [organizationId]);

  // Combine static and custom templates, marking defaults
  const allReceiptTemplates = useMemo(() => {
    const staticWithDefaults = staticReceiptTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultReceiptTemplateId === template.id
    }));
    
    const customWithDefaults = customReceiptTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultReceiptTemplateId === template.id
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [staticReceiptTemplates, customReceiptTemplates, printerSettings]);

  const allInvoiceTemplates = useMemo(() => {
    const staticWithDefaults = staticInvoiceTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultInvoiceTemplateId === template.id
    }));
    
    const customWithDefaults = customInvoiceTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultInvoiceTemplateId === template.id
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [staticInvoiceTemplates, customInvoiceTemplates, printerSettings]);

  const allQuoteTemplates = useMemo(() => {
    const staticWithDefaults = staticQuoteTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultQuoteTemplateId === template.id
    }));
    
    const customWithDefaults = customQuoteTemplates.map(template => ({
      ...template,
      isDefault: printerSettings?.defaultQuoteTemplateId === template.id
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [staticQuoteTemplates, customQuoteTemplates, printerSettings]);

  const loading = receiptLoading || invoiceLoading || quoteLoading;
  const error = receiptError || invoiceError || quoteError;

  return {
    staticReceiptTemplates,
    staticInvoiceTemplates,
    staticQuoteTemplates,
    customReceiptTemplates,
    customInvoiceTemplates,
    customQuoteTemplates,
    allReceiptTemplates,
    allInvoiceTemplates,
    allQuoteTemplates,
    loading,
    error,
  };
}