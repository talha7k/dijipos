"use client";

import { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useDocumentQuery, useUpdateDocumentMutation, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase/config';
import { Invoice, Organization } from '@/types';

export function usePurchaseInvoicesData(organizationId: string | undefined) {
  // Organization query
  const organizationQuery = useDocumentQuery(
    doc(db, 'organizations', organizationId || 'dummy'),
    {
      queryKey: ['organization', organizationId],
      enabled: !!organizationId,
    }
  );

  // Purchase invoices query
  const invoicesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-invoices'),
    {
      queryKey: ['purchase-invoices', organizationId],
      enabled: !!organizationId,
    }
  );

  // Process organization data
  const organization = useMemo(() => {
    if (!organizationQuery.data?.exists()) return null;
    const data = organizationQuery.data.data();
    return {
      id: organizationQuery.data.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
    } as Organization;
  }, [organizationQuery.data]);

  // Process invoices data
  const invoices = useMemo(() => {
    if (!invoicesQuery.data) return [];
    return invoicesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
    })) as Invoice[];
  }, [invoicesQuery.data]);

  return {
    invoices,
    organization,
    loading: invoicesQuery.isLoading || organizationQuery.isLoading,
  };
}

export function usePurchaseInvoiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const updateInvoiceMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'purchase-invoices', 'dummy')
  );
  
  const addInvoiceMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-invoices')
  );

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    setUpdatingStatus(invoiceId);
    try {
      const invoiceRef = doc(db, 'organizations', organizationId, 'purchase-invoices', invoiceId);
      await updateInvoiceMutation.mutateAsync({ status, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createInvoice = async (invoiceData: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    // Clean data to remove undefined values that Firebase doesn't accept
    const cleanedData = {
      ...invoiceData,
      supplierVAT: (invoiceData as { supplierVAT?: string }).supplierVAT || null,
      notes: invoiceData.notes || null,
      items: invoiceData.items.map(item => ({
        ...item,
        description: item.description || null,
        productId: item.productId || null,
        serviceId: item.serviceId || null,
      })),
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addInvoiceMutation.mutateAsync(cleanedData);
    } catch (error) {
      console.error('Error creating purchase invoice:', error);
      throw error;
    }
  };

  return {
    updateInvoiceStatus,
    createInvoice,
    updatingStatus,
  };
}