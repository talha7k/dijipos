"use client";

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate, PrinterFormat, ReceiptTemplateType } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';

// Global singleton state for receipt templates
const globalReceiptTemplatesState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: ReceiptTemplate[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `receipt-templates-${organizationId || 'none'}`;
}

export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setReceiptTemplates([]);
      setLoading(false);
      return;
    }

    const existingListener = globalReceiptTemplatesState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setReceiptTemplates(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalReceiptTemplatesState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener - using local templates for now
    setLoading(true);
    setError(null);

    // Simulate onSnapshot behavior with local data
    const defaultTemplates: ReceiptTemplate[] = [
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

    // Store the listener with local data
    globalReceiptTemplatesState.listeners.set(cacheKey, {
      unsubscribe: () => {}, // No-op for local data
      refCount: 1,
      data: defaultTemplates,
      loading: false,
      error: null,
    });

    setReceiptTemplates(defaultTemplates);
    setLoading(false);

    return () => {
      const listener = globalReceiptTemplatesState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalReceiptTemplatesState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  const addTemplate = async (template: Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(collection(db, 'organizations', organizationId, 'receiptTemplates'));
    const newTemplate: ReceiptTemplate = {
      ...template,
      id: templateRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(templateRef, newTemplate);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<ReceiptTemplate>) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'receiptTemplates', id);
    await setDoc(templateRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  };

  const deleteTemplate = async (id: string) => {
    if (!organizationId) throw new Error('No organization selected');

    const templateRef = doc(db, 'organizations', organizationId, 'receiptTemplates', id);
    await deleteDoc(templateRef);
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

  return { 
    receiptTemplates, 
    loading, 
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate,
  };
}