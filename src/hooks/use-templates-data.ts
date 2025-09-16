"use client";

import { useState, useMemo } from 'react';
import { UnifiedTemplate, TemplateCategory } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';
import { defaultEnglishQuoteTemplate } from '@/components/templates/default-quote-english';
import { defaultArabicQuoteTemplate } from '@/components/templates/default-quote-arabic';

export function useTemplatesData(organizationId: string | undefined, category?: TemplateCategory) {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    const baseTemplates: UnifiedTemplate[] = [];

    if (!category || category === TemplateCategory.RECEIPT) {
      baseTemplates.push(
        {
          id: 'default-thermal',
          name: 'Default Thermal Receipt',
          description: 'Default thermal printer receipt template in English',
          category: TemplateCategory.RECEIPT,
          type: 'english_thermal',
          content: defaultReceiptTemplate,
          isDefault: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'arabic-thermal',
          name: 'Arabic Thermal Receipt',
          description: 'Arabic thermal printer receipt template',
          category: TemplateCategory.RECEIPT,
          type: 'arabic_thermal',
          content: defaultArabicReceiptTemplate,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-a4',
          name: 'Default A4 Receipt',
          description: 'Default A4 paper receipt template',
          category: TemplateCategory.RECEIPT,
          type: 'english_a4',
          content: defaultReceiptA4Template,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'arabic-a4',
          name: 'Arabic A4 Receipt',
          description: 'Arabic A4 paper receipt template',
          category: TemplateCategory.RECEIPT,
          type: 'arabic_a4',
          content: defaultArabicReceiptA4Template,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    if (!category || category === TemplateCategory.INVOICE) {
      baseTemplates.push(
        {
          id: 'default-invoice-english',
          name: 'Default English Invoice',
          description: 'Default invoice template in English',
          category: TemplateCategory.INVOICE,
          type: 'english_invoice',
          content: defaultEnglishInvoiceTemplate,
          isDefault: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-invoice-arabic',
          name: 'Default Arabic Invoice',
          description: 'Default invoice template in Arabic',
          category: TemplateCategory.INVOICE,
          type: 'arabic_invoice',
          content: defaultArabicInvoiceTemplate,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    if (!category || category === TemplateCategory.QUOTE) {
      baseTemplates.push(
        {
          id: 'default-quote-english',
          name: 'Default English Quote',
          description: 'Default quote template in English',
          category: TemplateCategory.QUOTE,
          type: 'english_quote',
          content: defaultEnglishQuoteTemplate,
          isDefault: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-quote-arabic',
          name: 'Default Arabic Quote',
          description: 'Default quote template in Arabic',
          category: TemplateCategory.QUOTE,
          type: 'arabic_quote',
          content: defaultArabicQuoteTemplate,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
    }

    return baseTemplates;
  }, [organizationId, category]);

  // Update state with static templates
  useMemo(() => {
    setTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that don't do anything since we're using static data
  const addTemplate = async (template: Omit<UnifiedTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: UnifiedTemplate = {
      ...template,
      id: `custom-${Date.now()}`, // Generate a simple ID for new templates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to templates state
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<UnifiedTemplate>) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    // Update in templates state
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    // Remove from templates state
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    // First, unset all default templates
    setTemplates(prev => prev.map(template => ({ ...template, isDefault: false })));

    // Then set the new default
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, isDefault: true }
        : template
    ));
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      templates: [],
      loading: false,
      error: null,
      addTemplate: async () => { throw new Error('No organization selected'); },
      updateTemplate: async () => { throw new Error('No organization or category selected'); },
      deleteTemplate: async () => { throw new Error('No organization or category selected'); },
      setDefaultTemplate: async () => { throw new Error('No organization or category selected'); },
    };
  }

  return {
    templates,
    loading: false, // No loading since data is static
    error: null, // No error since data is static
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}