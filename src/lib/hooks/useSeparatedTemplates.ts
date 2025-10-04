import { useMemo } from "react";
import {
  ReceiptTemplate,
  InvoiceTemplate,
  QuoteTemplate,
  ReceiptTemplateType,
  InvoiceTemplateType,
  QuoteTemplateType,
} from "@/types";
import { useRealtimeCollection } from "./useRealtimeCollection";
import { useOrganization } from "./useOrganization";
import { useStoreSettings } from "./useStoreSettings";
import {
  STATIC_INVOICE_TEMPLATE_IDS,
  STATIC_QUOTE_TEMPLATE_IDS,
  STATIC_RECEIPT_TEMPLATE_IDS,
} from "@/types";

import { salesInvoiceEnglish } from "@/components/templates/invoice/sales-invoice-english";
import { purchaseInvoiceEnglish } from "@/components/templates/invoice/purchase-invoice-english";
import { salesInvoiceArabic } from "@/components/templates/invoice/sales-invoice-arabic";
import { purchaseInvoiceArabic } from "@/components/templates/invoice/purchase-invoice-arabic";
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
  const { storeSettings } = useStoreSettings();
  const printerSettings = storeSettings?.printerSettings;

  const organizationId = selectedOrganization?.id || null;

  // Get custom templates from Firestore
  const {
    data: customReceiptTemplates,
    loading: receiptLoading,
    error: receiptError,
  } = useRealtimeCollection<ReceiptTemplate>(
    "receiptTemplates",
    organizationId,
    [],
    null,
  );

  const {
    data: customInvoiceTemplates,
    loading: invoiceLoading,
    error: invoiceError,
  } = useRealtimeCollection<InvoiceTemplate>(
    "invoiceTemplates",
    organizationId,
    [],
    null,
  );

  const {
    data: customQuoteTemplates,
    loading: quoteLoading,
    error: quoteError,
  } = useRealtimeCollection<QuoteTemplate>(
    "quoteTemplates",
    organizationId,
    [],
    null,
  );

  // Get static templates (local only)
  const staticReceiptTemplates = useMemo(() => {
    if (!organizationId) return [];

    return [
      {
        id: "english-thermal",
        name: "English Thermal Receipt",
        description: "Default thermal printer receipt template in English",
        type: "english_thermal" as ReceiptTemplateType,
        content: "", // Will be loaded from actual template files
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "arabic-thermal",
        name: "Arabic Thermal Receipt",
        description: "Arabic thermal printer receipt template",
        type: "arabic_thermal" as ReceiptTemplateType,
        content: "",
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "english-a4",
        name: "English A4 Receipt",
        description: "English A4 paper receipt template",
        type: "english_a4" as ReceiptTemplateType,
        content: "",
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "arabic-a4",
        name: "Arabic A4 Receipt",
        description: "Arabic A4 paper receipt template",
        type: "arabic_a4" as ReceiptTemplateType,
        content: "",
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }, [organizationId]);

  const staticInvoiceTemplates = useMemo(() => {
    if (!organizationId) return [];

    return [
      {
        id: "sales-invoice-english",
        name: "Sales Invoice (English)",
        description: "English sales invoice template",
        type: "english" as InvoiceTemplateType,
        content: salesInvoiceEnglish,
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "purchase-invoice-english",
        name: "Purchase Invoice (English)",
        description: "English purchase invoice template",
        type: "english" as InvoiceTemplateType,
        content: purchaseInvoiceEnglish,
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sales-invoice-arabic",
        name: "فاتورة مبيعات (عربي)",
        description: "Arabic sales invoice template",
        type: "arabic" as InvoiceTemplateType,
        content: salesInvoiceArabic,
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "purchase-invoice-arabic",
        name: "فاتورة مشتريات (عربي)",
        description: "Arabic purchase invoice template",
        type: "arabic" as InvoiceTemplateType,
        content: purchaseInvoiceArabic,
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }, [organizationId]);

  const staticQuoteTemplates = useMemo(() => {
    if (!organizationId) return [];

    return [
      {
        id: "english-quote",
        name: "English Quote",
        description: "English quote template",
        type: "english" as QuoteTemplateType,
        content: "",
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "arabic-quote",
        name: "Arabic Quote",
        description: "Arabic quote template",
        type: "arabic" as QuoteTemplateType,
        content: "",
        isDefault: false,
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
        },
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }, [organizationId]);

  // Combine static and custom templates, marking defaults
  const allReceiptTemplates = useMemo(() => {
    const defaultId = printerSettings?.receipts?.defaultTemplateId;
    console.log(
      "[useSeparatedTemplates] Computing allReceiptTemplates with defaultId:",
      defaultId,
    );

    const staticWithDefaults = staticReceiptTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    const customWithDefaults = customReceiptTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [
    staticReceiptTemplates,
    customReceiptTemplates,
    printerSettings?.receipts?.defaultTemplateId,
  ]);

  const allInvoiceTemplates = useMemo(() => {
    const defaultId = printerSettings?.invoices?.defaultTemplateId;
    console.log(
      "[useSeparatedTemplates] Computing allInvoiceTemplates with defaultId:",
      defaultId,
    );

    const staticWithDefaults = staticInvoiceTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    const customWithDefaults = customInvoiceTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [
    staticInvoiceTemplates,
    customInvoiceTemplates,
    printerSettings?.invoices?.defaultTemplateId,
  ]);

  const allQuoteTemplates = useMemo(() => {
    const defaultId = printerSettings?.quotes?.defaultTemplateId;
    console.log(
      "[useSeparatedTemplates] Computing allQuoteTemplates with defaultId:",
      defaultId,
    );

    const staticWithDefaults = staticQuoteTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    const customWithDefaults = customQuoteTemplates.map((template) => ({
      ...template,
      isDefault: defaultId === template.id,
    }));

    return [...staticWithDefaults, ...customWithDefaults];
  }, [
    staticQuoteTemplates,
    customQuoteTemplates,
    printerSettings?.quotes?.defaultTemplateId,
  ]);

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
