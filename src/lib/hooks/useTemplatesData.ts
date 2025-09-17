"use client";

import { useState, useMemo } from 'react';
import { InvoiceTemplate, QuoteTemplate, TemplateCategory } from '@/types/template';
import { InvoiceTemplateType, QuoteTemplateType } from '@/types/enums';

import { defaultInvoiceEnglish } from '@/components/templates/invoice/default-invoice-english';
import { defaultInvoiceArabic } from '@/components/templates/invoice/default-invoice-arabic';
import { defaultQuoteEnglish } from '@/components/templates/quotes/default-quote-english';
import { defaultQuoteArabic } from '@/components/templates/quotes/default-quote-arabic';

export function useTemplatesData(organizationId: string | undefined, category: TemplateCategory) {
  const [templates, setTemplates] = useState<(InvoiceTemplate | QuoteTemplate)[]>([]);

  // Static templates data based on category
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    const baseTemplates = [];

    if (category === TemplateCategory.INVOICE) {
      baseTemplates.push(
        {
          id: 'default-invoice',
          name: 'Default Invoice',
          description: 'Default invoice template in English',
          type: InvoiceTemplateType.ENGLISH,
          content: defaultInvoiceEnglish,
          isDefault: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as InvoiceTemplate,
        {
          id: 'arabic-invoice',
          name: 'Arabic Invoice',
          description: 'Arabic invoice template',
          type: InvoiceTemplateType.ARABIC,
          content: defaultInvoiceArabic,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as InvoiceTemplate
      );
    } else if (category === TemplateCategory.QUOTE) {
      baseTemplates.push(
        {
          id: 'default-quote',
          name: 'Default Quote',
          description: 'Default quote template in English',
          type: QuoteTemplateType.ENGLISH,
          content: defaultQuoteEnglish,
          isDefault: true,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as QuoteTemplate,
        {
          id: 'arabic-quote',
          name: 'Arabic Quote',
          description: 'Arabic quote template',
          type: QuoteTemplateType.ARABIC,
          content: defaultQuoteArabic,
          isDefault: false,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as QuoteTemplate
      );
    }

    return baseTemplates;
  }, [organizationId, category]);

  // Update state with static templates
  useMemo(() => {
    setTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that update local state
  const addTemplate = async (template: Omit<InvoiceTemplate | QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`, // Generate a simple ID for new templates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to templates state
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<InvoiceTemplate | QuoteTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    // Update in templates state
    setTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // Remove from templates state
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

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
      updateTemplate: async () => { throw new Error('No organization selected'); },
      deleteTemplate: async () => { throw new Error('No organization selected'); },
      setDefaultTemplate: async () => { throw new Error('No organization selected'); },
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