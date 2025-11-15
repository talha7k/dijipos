"use client";

import { useState, useMemo } from 'react';
import { InvoiceTemplate } from '@/types/template';
import { InvoiceTemplateType } from '@/types/enums';
import { salesInvoiceEnglish } from '@/components/templates/invoice/sales-invoice-english';
import { salesInvoiceArabic } from '@/components/templates/invoice/sales-invoice-arabic';



export function useInvoicesTemplatesData(organizationId: string | undefined) {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    const baseTemplates: InvoiceTemplate[] = [];

    baseTemplates.push(
      {
        id: 'english-invoice',
        name: 'English Invoice',
        description: 'English invoice template',
        type: InvoiceTemplateType.ENGLISH,
        content: salesInvoiceEnglish,
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
        content: salesInvoiceArabic,
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
  }, [staticTemplates, organizationId]);

  // Mock mutations that update local state
  const addTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplateId = `custom-${Date.now()}`; // Generate ID outside of object
    const newTemplate = {
      ...template,
      id: newTemplateId,
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