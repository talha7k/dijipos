"use client";

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useSetDocumentMutation, useDeleteDocumentMutation, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate, ReceiptTemplateType } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);

  // Always call the hook, but conditionally enable it
  const receiptTemplatesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'receiptTemplates'),
    {
      queryKey: ['receiptTemplates', organizationId],
      enabled: !!organizationId,
    }
  );

  const processedTemplates = useMemo(() => {
    if (!receiptTemplatesQuery.data) {
      // Return default templates when no data from Firestore
      if (organizationId) {
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
      }
      return [];
    }
    
    return receiptTemplatesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ReceiptTemplate[];
  }, [receiptTemplatesQuery.data, organizationId]);

  // Update state
  useMemo(() => {
    setReceiptTemplates(processedTemplates);
  }, [processedTemplates]);

  const addTemplateMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'receiptTemplates')
  );
  
  const setTemplateMutation = useSetDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'receiptTemplates', 'dummy')
  );
  
  const deleteTemplateMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'receiptTemplates', 'dummy')
  );

  const addTemplate = async (template: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: ReceiptTemplate = {
      ...template,
      id: '', // Will be set by Firebase
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addTemplateMutation.mutateAsync(newTemplate);
    return { ...newTemplate, id: docRef.id };
  };

  const updateTemplate = async (id: string, updates: Partial<ReceiptTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'receiptTemplates', id);
    await setTemplateMutation.mutateAsync({
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'receiptTemplates', id);
    await deleteTemplateMutation.mutateAsync();
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    // First, unset all default templates
    const currentTemplates = receiptTemplates.filter(t => t.isDefault);
    for (const template of currentTemplates) {
      await updateTemplate(template.id, { isDefault: false });
    }

    // Then set the new default
    await updateTemplate(id, { isDefault: true });
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
    loading: receiptTemplatesQuery.isLoading,
    error: receiptTemplatesQuery.error?.message || null,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}