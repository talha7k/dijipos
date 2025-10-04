"use client";

import { useState, useMemo } from "react";
import { ReceiptTemplate } from "@/types/template";
import { ReceiptTemplateType } from "@/types/enums";
import { defaultEnglishReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-english";
import { defaultArabicReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-arabic";
import { defaultReceiptA4Template } from "@/components/templates/receipt/default-receipt-a4-english";
import { defaultArabicReceiptA4Template } from "@/components/templates/receipt/default-receipt-a4-arabic";
import {
  STATIC_RECEIPT_TEMPLATE_IDS,
  STATIC_INVOICE_TEMPLATE_IDS,
} from "@/types";
export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>(
    [],
  );

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    return [
      {
        id: "english-thermal",
        name: "English Thermal Receipt",
        description: "Default thermal printer receipt template in English",
        type: ReceiptTemplateType.ENGLISH_THERMAL,
        content: defaultEnglishReceiptTemplate,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "arabic-thermal",
        name: "Arabic Thermal Receipt",
        description: "Arabic thermal printer receipt template",
        type: ReceiptTemplateType.ARABIC_THERMAL,
        content: defaultArabicReceiptTemplate,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "english-a4",
        name: "English A4 Receipt",
        description: "English A4 paper receipt template",
        type: ReceiptTemplateType.ENGLISH_A4,
        content: defaultReceiptA4Template,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "arabic-a4",
        name: "Arabic A4 Receipt",
        description: "Arabic A4 paper receipt template",
        type: ReceiptTemplateType.ARABIC_A4,
        content: defaultArabicReceiptA4Template,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }, [organizationId]);

  // Update state with static templates
  useMemo(() => {
    console.log(`[useReceiptTemplatesData] Setting templates:`, {
      organizationId,
      templatesCount: staticTemplates.length,
      templates: staticTemplates.map((t) => ({ id: t.id, name: t.name })),
    });
    setReceiptTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that update local state
  const addTemplate = async (
    template: Omit<ReceiptTemplate, "id" | "createdAt" | "updatedAt">,
  ) => {
    if (!organizationId) throw new Error("No organization selected");

    const newTemplate: ReceiptTemplate = {
      ...template,
      id: `custom-${Date.now()}`, // Generate a simple ID for new templates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to templates state
    setReceiptTemplates((prev) => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (
    id: string,
    updates: Partial<ReceiptTemplate>,
  ) => {
    if (!organizationId) throw new Error("No organization selected");

    // Update in templates state
    setReceiptTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? { ...template, ...updates, updatedAt: new Date() }
          : template,
      ),
    );
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error("No organization selected");

    // Remove from templates state
    setReceiptTemplates((prev) =>
      prev.filter((template) => template.id !== id),
    );
  };

  // setDefaultTemplate is no longer needed - defaults are managed in printer settings
  // const setDefaultTemplate = async (id: string) => {
  //   if (!organizationId) throw new Error('No organization selected');
  //   // This functionality is now handled by printer settings
  // };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      receiptTemplates: [],
      loading: false,
      error: null,
      addTemplate: async () => {
        throw new Error("No organization selected");
      },
      updateTemplate: async () => {
        throw new Error("No organization selected");
      },
      deleteTemplate: async () => {
        throw new Error("No organization selected");
      },
      // setDefaultTemplate is no longer needed - defaults are managed in printer settings
    };
  }

  return {
    receiptTemplates,
    loading: false, // No loading since data is static
    error: null, // No error since data is static
    addTemplate,
    updateTemplate,
    deleteTemplate,
    // setDefaultTemplate is no longer needed - defaults are managed in printer settings
  };
}
