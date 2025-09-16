"use client";

import { useState, useMemo } from 'react';
import { collection, doc, setDoc, deleteDoc, DocumentReference, SetOptions } from 'firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { useCollectionQuery, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { UnifiedTemplate, TemplateCategory } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

export function useTemplatesData(organizationId: string | undefined, category?: TemplateCategory) {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);

  // Always call the hook, but conditionally enable it
  const collectionName = `${category || 'receipt'}Templates`;
  const templatesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', collectionName),
    {
      queryKey: ['templates', organizationId, category],
      enabled: !!organizationId,
    }
  );

  const processedTemplates = useMemo(() => {
    if (!templatesQuery.data) {
      // If no templates exist in Firestore, provide default templates for receipts
      if ((!category || category === TemplateCategory.RECEIPT) && organizationId) {
        return [
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
        ];
      }
      return [];
    }
    
    return templatesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      category: category || TemplateCategory.RECEIPT,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as UnifiedTemplate[];
  }, [templatesQuery.data, category, organizationId]);

  // Update state
  useMemo(() => {
    setTemplates(processedTemplates);
  }, [processedTemplates]);

  const addTemplateMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', collectionName)
  );

  const setTemplateMutation = useMutation({
    mutationFn: async ({ docRef, data, options }: { docRef: DocumentReference; data: Partial<UnifiedTemplate>; options: SetOptions }) => {
      await setDoc(docRef, data, options);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (docRef: DocumentReference) => {
      await deleteDoc(docRef);
    },
  });

  const addTemplate = async (template: Omit<UnifiedTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const newTemplate: UnifiedTemplate = {
      ...template,
      id: '', // Will be set by Firebase
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addTemplateMutation.mutateAsync(newTemplate);
    return { ...newTemplate, id: docRef.id };
  };

  const updateTemplate = async (id: string, updates: Partial<UnifiedTemplate>) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    const templateRef = doc(db, 'organizations', organizationId, collectionName, id);
    await setTemplateMutation.mutateAsync({
      docRef: templateRef,
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      options: { merge: true }
    });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    const templateRef = doc(db, 'organizations', organizationId, collectionName, id);
    await deleteTemplateMutation.mutateAsync(templateRef);
  };

  const setDefaultTemplate = async (id: string) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    // First, unset all default templates
    const currentTemplates = templates.filter(t => t.isDefault);
    for (const template of currentTemplates) {
      await updateTemplate(template.id, { isDefault: false });
    }

    // Then set the new default
    await updateTemplate(id, { isDefault: true });
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
    loading: templatesQuery.isLoading,
    error: templatesQuery.error?.message || null,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}