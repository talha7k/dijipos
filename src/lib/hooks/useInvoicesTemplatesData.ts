"use client";

import { useState, useMemo } from 'react';
import { InvoiceTemplate } from '@/types/template';
import { InvoiceTemplateType } from '@/types/enums';

import { defaultInvoiceEnglish } from '@/components/templates/invoice/default-invoice-english';
import { defaultInvoiceArabic } from '@/components/templates/invoice/default-invoice-arabic';

export function useInvoicesTemplatesData(organizationId: string | undefined) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    const baseTemplates: InvoiceTemplate[] = [];

    baseTemplates.push(
      {
        id: 'default-invoice',
        name: 'Default Invoice',
        description: 'Default invoice template in English',
        type: InvoiceTemplateType.ENGLISH,
        content: defaultInvoiceEnglish,
        organizationId,
        fields: [],
        style: {
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'arabic-invoice',
        name: 'Arabic Invoice',
        description: 'Arabic invoice template',
        type: InvoiceTemplateType.ARABIC,
        content: defaultInvoiceArabic,
        organizationId,
        fields: [],
        style: {
          primaryColor: '#007bff',
          secondaryColor: '#6c757d',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          fontFamily: 'Arial, sans-serif',
          fontSize: 12,
          showLogo: true,
          showWatermark: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    return baseTemplates;
  }, [organizationId]);

  // Update state with static templates
  useMemo(() => {
    console.log(`[useInvoicesTemplatesData] Setting templates:`, {
      organizationId,
      templatesCount: staticTemplates.length,
      templates: staticTemplates.map(t => ({ id: t.id, name: t.name }))
    });
    setTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that update local state
  const addTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const updateTemplate = async (id: string, updates: Partial<InvoiceTemplate>) => {
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

  // setDefaultTemplate is no longer needed - defaults are managed in printer settings
  // const setDefaultTemplate = async (id: string) => {
  //   if (!organizationId) throw new Error('No organization selected');
  //   // This functionality is now handled by printer settings
  // };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      templates: [],
      loading: false,
      error: null,
      addTemplate: async () => { throw new Error('No organization selected'); },
      updateTemplate: async () => { throw new Error('No organization selected'); },
      deleteTemplate: async () => { throw new Error('No organization selected'); },
      // setDefaultTemplate is no longer needed - defaults are managed in printer settings
    };
  }

  return {
    templates,
    loading: false, // No loading since data is static
    error: null, // No error since data is static
    addTemplate,
    updateTemplate,
    deleteTemplate,
    // setDefaultTemplate is no longer needed - defaults are managed in printer settings
  };
}