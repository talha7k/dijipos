"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate, InvoiceTemplate, QuoteTemplate, TemplateCategory, UnifiedTemplate } from '@/types';
import { ReceiptTemplateType } from '@/types/enums';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

export function useTemplatesData(organizationId: string | undefined, category?: TemplateCategory) {
  const [templates, setTemplates] = useState<UnifiedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

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
        if (templates.length === 0 && (!category || category === TemplateCategory.RECEIPT)) {
          const defaultTemplates: UnifiedTemplate[] = [
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
          setTemplates(defaultTemplates);
        } else {
          setTemplates(templates);
        }
        setLoading(false);
      },
      (error) => {
        console.error(`Error fetching ${category || 'receipt'} templates:`, error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId, category]);

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