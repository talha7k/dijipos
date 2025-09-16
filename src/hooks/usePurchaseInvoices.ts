"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice, Organization } from '@/types';

// Global singleton to prevent duplicate listeners
const globalPurchaseInvoiceListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function usePurchaseInvoicesData(organizationId: string | undefined) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setInvoices([]);
      return;
    }

    const listenerKey = `purchase-invoices-${organizationId}`;
    
    // Check if listener already exists
    if (globalPurchaseInvoiceListeners.has(listenerKey)) {
      const existing = globalPurchaseInvoiceListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalPurchaseInvoiceListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);

    // Fetch organization data
    const fetchOrganization = async () => {
      try {
        const organizationDoc = await getDoc(doc(db, 'organizations', organizationId));
        if (organizationDoc.exists()) {
          setOrganization({
            id: organizationDoc.id,
            ...organizationDoc.data(),
            createdAt: organizationDoc.data().createdAt?.toDate(),
          } as Organization);
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    // Fetch purchase invoices with real-time updates
    const invoicesQ = query(collection(db, 'organizations', organizationId, 'purchase-invoices'));
    const unsubscribe = onSnapshot(invoicesQ, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
      })) as Invoice[];
      setInvoices(invoicesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching purchase invoices:', error);
      setLoading(false);
    });

    // Execute fetch operations
    fetchOrganization();

    // Store in global singleton
    globalPurchaseInvoiceListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalPurchaseInvoiceListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalPurchaseInvoiceListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const invoicesMemo = useMemo(() => invoices, [invoices]);

  return {
    invoices: invoicesMemo,
    organization,
    loading,
  };
}

export function usePurchaseInvoiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    setUpdatingStatus(invoiceId);
    try {
      const invoiceRef = doc(db, 'organizations', organizationId, 'purchase-invoices', invoiceId);
      await updateDoc(invoiceRef, { status, updatedAt: new Date() });
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
      await addDoc(collection(db, 'organizations', organizationId, 'purchase-invoices'), cleanedData);
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