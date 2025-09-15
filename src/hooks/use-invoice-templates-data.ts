"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvoiceTemplate, InvoiceTemplateType } from '@/types';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';

export function useInvoiceTemplatesData(organizationId: string | undefined) {
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setInvoiceTemplates([]);
      setLoading(false);
      return;
    }

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
        if (templates.length === 0) {
          const defaultTemplates: InvoiceTemplate[] = [
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
          setInvoiceTemplates(defaultTemplates);
        } else {
          setInvoiceTemplates(templates);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invoice templates:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

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