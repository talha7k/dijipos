"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvoiceTemplate, InvoiceTemplateType } from '@/types';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';

// Global singleton state for invoice templates
const globalInvoiceTemplatesState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: InvoiceTemplate[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `invoice-templates-${organizationId || 'none'}`;
}

export function useInvoiceTemplatesData(organizationId: string | undefined) {
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setInvoiceTemplates([]);
      setLoading(false);
      return;
    }

    const existingListener = globalInvoiceTemplatesState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setInvoiceTemplates(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalInvoiceTemplatesState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const invoiceTemplatesQuery = query(
      collection(db, 'organizations', organizationId, 'invoiceTemplates')
    );

    const unsubscribe = onSnapshot(
      invoiceTemplatesQuery,
      (querySnapshot) => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as InvoiceTemplate[];

        // If no templates exist in Firestore, provide default templates
        let finalTemplates = templates;
        if (templates.length === 0) {
          finalTemplates = [
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

        const listener = globalInvoiceTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.data = finalTemplates;
          listener.loading = false;
          listener.error = null;
        }
        setInvoiceTemplates(finalTemplates);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invoice templates:', error);
        const listener = globalInvoiceTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalInvoiceTemplatesState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalInvoiceTemplatesState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalInvoiceTemplatesState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  const addTemplate = async (template: Omit<InvoiceTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(collection(db, 'organizations', organizationId, 'invoiceTemplates'));
    const newTemplate: InvoiceTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(templateRef, newTemplate);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<InvoiceTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'invoiceTemplates', id);
    await setDoc(templateRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'invoiceTemplates', id);
    await deleteDoc(templateRef);
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

  return {
    invoiceTemplates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}