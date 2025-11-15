import { useMemo } from "react";
import {
  ReceiptTemplate,
  InvoiceTemplate,
  ReceiptTemplateType,
  InvoiceTemplateType,
} from "@/types";
import { useRealtimeCollection } from "./useRealtimeCollection";
import { useOrganization } from "./useOrganization";
import { useStoreSettings } from "./useStoreSettings";
import { salesInvoiceEnglish } from "@/components/templates/invoice/sales-invoice-english";
import { purchaseInvoiceEnglish } from "@/components/templates/invoice/purchase-invoice-english";
import { salesInvoiceArabic } from "@/components/templates/invoice/sales-invoice-arabic";
import { purchaseInvoiceArabic } from "@/components/templates/invoice/purchase-invoice-arabic";
interface SeparatedTemplatesState {
  // Static templates (always available, not in Firestore)
  staticReceiptTemplates: ReceiptTemplate[];
  staticInvoiceTemplates: InvoiceTemplate[];

  // Custom templates (from Firestore)
  customReceiptTemplates: ReceiptTemplate[];
  customInvoiceTemplates: InvoiceTemplate[];

  // Combined templates for UI (static + custom)
  allReceiptTemplates: ReceiptTemplate[];
  allInvoiceTemplates: InvoiceTemplate[];

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

  const organizationId = selectedOrganization?.id || null;

  const additionalConstraints = useMemo(() => [], []);

  // Get custom templates from Firestore
  const {
    data: customReceiptTemplates,
    loading: receiptLoading,
    error: receiptError,
  } = useRealtimeCollection<ReceiptTemplate>(
    "receiptTemplates",
    organizationId,
    additionalConstraints,
    null,
  );

  const {
    data: customInvoiceTemplates,
    loading: invoiceLoading,
    error: invoiceError,
  } = useRealtimeCollection<InvoiceTemplate>(
    "invoiceTemplates",
    organizationId,
    additionalConstraints,
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



  // Combine static and custom templates, marking defaults
  const allReceiptTemplates = useMemo(() => {
    const defaultId = storeSettings?.printerSettings?.receipts?.defaultTemplateId;
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
    storeSettings?.printerSettings?.receipts?.defaultTemplateId,
  ]);

  const allInvoiceTemplates = useMemo(() => {
    const defaultId = storeSettings?.printerSettings?.invoices?.defaultSalesTemplateId;
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
    storeSettings?.printerSettings?.invoices?.defaultSalesTemplateId,
  ]);



  const loading = receiptLoading || invoiceLoading;
  const error = receiptError || invoiceError;

  return {
    staticReceiptTemplates,
    staticInvoiceTemplates,
    customReceiptTemplates,
    customInvoiceTemplates,
    allReceiptTemplates,
    allInvoiceTemplates,
    loading,
    error,
  };
}
