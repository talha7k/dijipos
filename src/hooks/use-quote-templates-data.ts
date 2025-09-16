"use client";

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useSetDocumentMutation, useDeleteDocumentMutation, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { QuoteTemplate, QuoteTemplateType } from '@/types';
import { defaultEnglishQuoteTemplate } from '@/components/templates/default-quote-english';
import { defaultArabicQuoteTemplate } from '@/components/templates/default-quote-arabic';

export function useQuoteTemplatesData(organizationId: string | undefined) {
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);

  // Always call the hook, but conditionally enable it
  const quoteTemplatesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'quoteTemplates'),
    {
      queryKey: ['quoteTemplates', organizationId],
      enabled: !!organizationId,
    }
  );

  const processedTemplates = useMemo(() => {
    if (!quoteTemplatesQuery.data) return [];
    
    const templates = quoteTemplatesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as QuoteTemplate[];

    // If no templates exist in Firestore, provide default templates
    if (templates.length === 0 && organizationId) {
      return [
        {
          id: 'default-english',
          name: 'Default English Quote',
          description: 'Default English quote template',
          type: QuoteTemplateType.ENGLISH,
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
          content: defaultEnglishQuoteTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'default-arabic',
          name: 'Default Arabic Quote',
          description: 'Default Arabic quote template',
          type: QuoteTemplateType.ARABIC,
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
          content: defaultArabicQuoteTemplate,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
    }
    
    return templates;
  }, [quoteTemplatesQuery.data, organizationId]);

  // Update state
  useMemo(() => {
    setQuoteTemplates(processedTemplates);
  }, [processedTemplates]);

  const addTemplateMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'quoteTemplates')
  );
  
  const setTemplateMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'quoteTemplates', 'dummy')
  );
  
  const deleteTemplateMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'quoteTemplates', 'dummy')
  );

  const addTemplate = async (template: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: QuoteTemplate = {
      ...template,
      id: '', // Will be set by Firebase
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addTemplateMutation.mutateAsync(newTemplate);
    return { ...newTemplate, id: docRef.id };
  };

  const updateTemplate = async (id: string, updates: Partial<QuoteTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'quoteTemplates', id);
    await setTemplateMutation.mutateAsync({
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'quoteTemplates', id);
    await deleteTemplateMutation.mutateAsync();
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // First, unset all default templates
    const currentTemplates = quoteTemplates.filter(t => t.isDefault);
    for (const template of currentTemplates) {
      await updateTemplate(template.id, { isDefault: false });
    }

    // Then set the new default
    await updateTemplate(id, { isDefault: true });
  };

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      quoteTemplates: [],
      loading: false,
      error: null,
      addTemplate: async () => { throw new Error('No organization selected'); },
      updateTemplate: async () => { throw new Error('No organization selected'); },
      deleteTemplate: async () => { throw new Error('No organization selected'); },
      setDefaultTemplate: async () => { throw new Error('No organization selected'); },
    };
  }

  return {
    quoteTemplates,
    loading: quoteTemplatesQuery.isLoading,
    error: quoteTemplatesQuery.error?.message || null,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}