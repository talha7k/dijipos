"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate, TemplateCategory, UnifiedTemplate } from '@/types';
import { ReceiptTemplateType } from '@/types/enums';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

// Global singleton state for templates
const globalTemplatesState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: UnifiedTemplate[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined, category?: TemplateCategory): string {
  return `${organizationId || 'none'}-${category || 'receipt'}`;
}

export function useTemplatesData(organizationId: string | undefined, category?: TemplateCategory) {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId, category), [organizationId, category]);

  useEffect(() => {
    if (!organizationId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    const existingListener = globalTemplatesState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setTemplates(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalTemplatesState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const collectionName = `${category || 'receipt'}Templates`;
    const templatesQuery = query(
      collection(db, 'organizations', organizationId, collectionName)
    );

    const unsubscribe = onSnapshot(
      templatesQuery,
      (querySnapshot) => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category: category || TemplateCategory.RECEIPT,
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as UnifiedTemplate[];

        // If no templates exist in Firestore, provide default templates for receipts
        let finalTemplates = templates;
        if (templates.length === 0 && (!category || category === TemplateCategory.RECEIPT)) {
          finalTemplates = [
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

        const listener = globalTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.data = finalTemplates;
          listener.loading = false;
          listener.error = null;
        }
        setTemplates(finalTemplates);
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${category || 'receipt'} templates:`, error);
        const listener = globalTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalTemplatesState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalTemplatesState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalTemplatesState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, category, cacheKey]);

  const addTemplate = async (template: Omit<UnifiedTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const collectionName = `${template.category}Templates`;
    const templateRef = doc(collection(db, 'organizations', organizationId, collectionName));
    const newTemplate: UnifiedTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(templateRef, newTemplate);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<UnifiedTemplate>) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    const collectionName = `${category}Templates`;
    const templateRef = doc(db, 'organizations', organizationId, collectionName, id);
    await setDoc(templateRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId || !category) throw new Error('No organization or category selected');

    const collectionName = `${category}Templates`;
    const templateRef = doc(db, 'organizations', organizationId, collectionName, id);
    await deleteDoc(templateRef);
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

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}