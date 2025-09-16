"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuoteTemplate, QuoteTemplateType } from '@/types';
import { defaultEnglishQuoteTemplate } from '@/components/templates/default-quote-english';
import { defaultArabicQuoteTemplate } from '@/components/templates/default-quote-arabic';

// Global singleton state for quote templates
const globalQuoteTemplatesState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: QuoteTemplate[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `quote-templates-${organizationId || 'none'}`;
}

export function useQuoteTemplatesData(organizationId: string | undefined) {
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setQuoteTemplates([]);
      setLoading(false);
      return;
    }

    const existingListener = globalQuoteTemplatesState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setQuoteTemplates(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalQuoteTemplatesState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const quoteTemplatesQuery = query(
      collection(db, 'organizations', organizationId, 'quoteTemplates')
    );

    const unsubscribe = onSnapshot(
      quoteTemplatesQuery,
      (querySnapshot) => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as QuoteTemplate[];

        // If no templates exist in Firestore, provide default templates
        let finalTemplates = templates;
        if (templates.length === 0) {
          finalTemplates = [
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

        const listener = globalQuoteTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.data = finalTemplates;
          listener.loading = false;
          listener.error = null;
        }
        setQuoteTemplates(finalTemplates);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching quote templates:', error);
        const listener = globalQuoteTemplatesState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalQuoteTemplatesState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalQuoteTemplatesState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalQuoteTemplatesState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  const addTemplate = async (template: Omit<QuoteTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(collection(db, 'organizations', organizationId, 'quoteTemplates'));
    const newTemplate: QuoteTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(templateRef, newTemplate);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<QuoteTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'quoteTemplates', id);
    await setDoc(templateRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'quoteTemplates', id);
    await deleteDoc(templateRef);
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

  return {
    quoteTemplates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}