"use client";

import { useState, useMemo } from 'react';
import { ReceiptTemplate, ReceiptTemplateType } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);

  // Static templates data
  const staticTemplates = useMemo(() => {
    if (!organizationId) return [];

    return [
      {
        id: 'default-thermal',
        name: 'Default Thermal Receipt',
        description: 'Default thermal printer receipt template in English',
        type: ReceiptTemplateType.ENGLISH_THERMAL,
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
        type: ReceiptTemplateType.ARABIC_THERMAL,
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
        type: ReceiptTemplateType.ENGLISH_A4,
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
        type: ReceiptTemplateType.ARABIC_A4,
        content: defaultArabicReceiptA4Template,
        isDefault: false,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }, [organizationId]);

  // Update state with static templates
  useMemo(() => {
    setReceiptTemplates(staticTemplates);
  }, [staticTemplates]);

  // Mock mutations that update local state
  const addTemplate = async (template: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: ReceiptTemplate = {
      ...template,
      id: `custom-${Date.now()}`, // Generate a simple ID for new templates
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to templates state
    setReceiptTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<ReceiptTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    // Update in templates state
    setReceiptTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, ...updates, updatedAt: new Date() }
        : template
    ));
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // Remove from templates state
    setReceiptTemplates(prev => prev.filter(template => template.id !== id));
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // First, unset all default templates
    setReceiptTemplates(prev => prev.map(template => ({ ...template, isDefault: false })));

    // Then set the new default
    setReceiptTemplates(prev => prev.map(template =>
      template.id === id
        ? { ...template, isDefault: true }
        : template
    ));
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      receiptTemplates: [],
      loading: false,
      error: null,
      addTemplate: async () => { throw new Error('No organization selected'); },
      updateTemplate: async () => { throw new Error('No organization selected'); },
      deleteTemplate: async () => { throw new Error('No organization selected'); },
      setDefaultTemplate: async () => { throw new Error('No organization selected'); },
    };
  }

  return {
    receiptTemplates,
    loading: false, // No loading since data is static
    error: null, // No error since data is static
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}