"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ReceiptTemplate, PrinterFormat } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';

export function useReceiptTemplatesData(organizationId: string | undefined) {
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setReceiptTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const receiptTemplatesQuery = query(
      collection(db, 'organizations', organizationId, 'receiptTemplates')
    );

    const unsubscribe = onSnapshot(
      receiptTemplatesQuery,
      (querySnapshot) => {
        const templates = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ReceiptTemplate[];
        
        // If no templates exist in Firestore, provide default templates
        if (templates.length === 0) {
          const defaultTemplates: ReceiptTemplate[] = [
            {
              id: 'default-thermal',
              name: 'Default Thermal Receipt',
              description: 'Default thermal printer receipt template',
              type: PrinterFormat.THERMAL,
              content: defaultReceiptTemplate,
              isDefault: true,
              organizationId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'default-a4',
              name: 'Default A4 Receipt',
              description: 'Default A4 paper receipt template',
              type: PrinterFormat.A4,
              content: defaultReceiptTemplate,
              isDefault: false,
              organizationId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];
          setReceiptTemplates(defaultTemplates);
        } else {
          setReceiptTemplates(templates);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receipt templates:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return { receiptTemplates, loading, error };
}