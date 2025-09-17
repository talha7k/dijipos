"use client";

import { useState, useMemo } from 'react';
import { QuoteTemplate } from '@/types/template';
import { QuoteTemplateType } from '@/types/enums';

import { defaultQuoteEnglish } from '@/components/templates/quotes/default-quote-english';
import { defaultQuoteArabic } from '@/components/templates/quotes/default-quote-arabic';

export function useQuotesTemplatesData(organizationId: string | undefined) {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    const baseTemplates: QuoteTemplate[] = [];

    baseTemplates.push(
      {
        id: 'default-quote',
        name: 'Default Quote',
        description: 'Default quote template in English',
        type: QuoteTemplateType.ENGLISH,
        content: defaultQuoteEnglish,
        isDefault: true,
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
        id: 'arabic-quote',
        name: 'Arabic Quote',
        description: 'Arabic quote template',
        type: QuoteTemplateType.ARABIC,
        content: defaultQuoteArabic,
        isDefault: false,
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
    setTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that update local state
  const addTemplate = async (template: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
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

  const updateTemplate = async (id: string, updates: Partial<QuoteTemplate>) => {
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