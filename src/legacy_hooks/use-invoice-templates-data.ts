"use client";

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useSetDocumentMutation, useDeleteDocumentMutation, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { InvoiceTemplate, InvoiceTemplateType } from '@/types';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';

export function useInvoiceTemplatesData(organizationId: string | undefined) {
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);

  // Always call the hook, but conditionally enable it
  const invoiceTemplatesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'invoiceTemplates'),
    {
      queryKey: ['invoiceTemplates', organizationId],
      enabled: !!organizationId,
    }
  );

  const processedTemplates = useMemo(() => {
    if (!invoiceTemplatesQuery.data) return [];
    
    const templates = invoiceTemplatesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as InvoiceTemplate[];

    // If no templates exist in Firestore, provide default templates
    if (templates.length === 0 && organizationId) {
      return [
        {
          id: 'default-english',
          name: 'Default English Invoice',
          description: 'Default English invoice template',
          type: InvoiceTemplateType.ENGLISH,
          isDefault: true,
          organizationId,
          fields: [], // Default fields would be defined
          style: {
            primaryColor: '#000000',
            secondaryColor: '#666666',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            showLogo: false,
            showWatermark: false,
          },
          content: defaultEnglishInvoiceTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-arabic',
          name: 'Default Arabic Invoice',
          description: 'Default Arabic invoice template',
          type: InvoiceTemplateType.ARABIC,
          isDefault: false,
          organizationId,
          fields: [], // Default fields would be defined
          style: {
            primaryColor: '#000000',
            secondaryColor: '#666666',
            backgroundColor: '#ffffff',
            textColor: '#000000',
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            showLogo: false,
            showWatermark: false,
          },
          content: defaultArabicInvoiceTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    }
    
    return templates;
  }, [invoiceTemplatesQuery.data, organizationId]);

  // Update state
  useMemo(() => {
    setInvoiceTemplates(processedTemplates);
  }, [processedTemplates]);

  const addTemplateMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'invoiceTemplates')
  );
  
  const setTemplateMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'invoiceTemplates', 'dummy')
  );
  
  const deleteTemplateMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'invoiceTemplates', 'dummy')
  );

  const addTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: InvoiceTemplate = {
      ...template,
      id: '', // Will be set by Firebase
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addTemplateMutation.mutateAsync(newTemplate);
    return { ...newTemplate, id: docRef.id };
  };

  const updateTemplate = async (id: string, updates: Partial<InvoiceTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'invoiceTemplates', id);
    await setTemplateMutation.mutateAsync({
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'invoiceTemplates', id);
    await deleteTemplateMutation.mutateAsync();
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // First, unset all default templates
    const currentTemplates = invoiceTemplates.filter(t => t.isDefault);
    for (const template of currentTemplates) {
      await updateTemplate(template.id, { isDefault: false });
    }

    // Then set the new default
    await updateTemplate(id, { isDefault: true });
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      invoiceTemplates: [],
      loading: false,
      error: null,
      addTemplate: async () => { throw new Error('No organization selected'); },
      updateTemplate: async () => { throw new Error('No organization selected'); },
      deleteTemplate: async () => { throw new Error('No organization selected'); },
      setDefaultTemplate: async () => { throw new Error('No organization selected'); },
    };
  }

  return {
    invoiceTemplates,
    loading: invoiceTemplatesQuery.isLoading,
    error: invoiceTemplatesQuery.error?.message || null,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}