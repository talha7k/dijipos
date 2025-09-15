"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuoteTemplate, QuoteTemplateType } from '@/types';
import { defaultEnglishQuoteTemplate } from '@/components/templates/default-quote-english';
import { defaultArabicQuoteTemplate } from '@/components/templates/default-quote-arabic';

export function useQuoteTemplatesData(organizationId: string | undefined) {
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setQuoteTemplates([]);
      setLoading(false);
      return;
    }

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
        if (templates.length === 0) {
          const defaultTemplates: QuoteTemplate[] = [
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
          setQuoteTemplates(defaultTemplates);
        } else {
          setQuoteTemplates(templates);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching quote templates:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

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