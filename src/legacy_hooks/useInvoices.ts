import { useMemo, useState } from 'react';
import { useAtom } from 'jotai';
import { collection, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice, Organization, Customer, Supplier, Payment } from '@/types';
import { useCollectionQuery, useDocumentQuery, useUpdateDocumentMutation, useAddDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import {
  invoicesAtom,
  invoicesLoadingAtom,
  invoicesErrorAtom,
  suppliersAtom,
  suppliersLoadingAtom,
  suppliersErrorAtom,
  invoicePaymentsAtom,
  invoicePaymentsLoadingAtom,
  invoicePaymentsErrorAtom
} from '@/store/atoms';

export function useInvoicesData(organizationId: string | undefined) {
  const [, setInvoices] = useAtom(invoicesAtom);
  const [, setSuppliers] = useAtom(suppliersAtom);
  const [, setLoading] = useAtom(invoicesLoadingAtom);
  const [paymentsByInvoice, setPaymentsByInvoice] = useState<{ [invoiceId: string]: Payment[] }>({});

  // Always call the hooks, but conditionally enable them
  // Organization query
  const organizationQuery = useDocumentQuery(
    doc(db, 'organizations', organizationId || 'dummy'),
    {
      queryKey: ['organization', organizationId],
      enabled: !!organizationId,
    }
  );

  // Customers query
  const customersQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'customers'),
    {
      queryKey: ['customers', organizationId],
      enabled: !!organizationId,
    }
  );

  // Suppliers query
  const suppliersQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'suppliers'),
    {
      queryKey: ['suppliers', organizationId],
      enabled: !!organizationId,
    }
  );

  // Payments query
  const paymentsQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'payments'),
    {
      queryKey: ['payments', organizationId],
      enabled: !!organizationId,
    }
  );

  // Invoices query
  const invoicesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'invoices'),
    {
      queryKey: ['invoices', organizationId],
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

  // Process customers data
  const customers = useMemo(() => {
    if (!customersQuery.data) return [];
    return customersQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Customer[];
  }, [customersQuery.data]);

  // Process suppliers data
  const suppliers = useMemo(() => {
    if (!suppliersQuery.data) return [];
    return suppliersQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Supplier[];
  }, [suppliersQuery.data]);

  // Process payments data
  const paymentsGrouped = useMemo(() => {
    if (!paymentsQuery.data) return {};
    const paymentsData = paymentsQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Payment[];

    // Group payments by invoiceId
    const paymentsByInvoice: { [invoiceId: string]: Payment[] } = {};
    paymentsData.forEach(payment => {
      if (!paymentsByInvoice[payment.invoiceId]) {
        paymentsByInvoice[payment.invoiceId] = [];
      }
      paymentsByInvoice[payment.invoiceId].push(payment);
    });
    return paymentsByInvoice;
  }, [paymentsQuery.data]);

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

  // Update state when data changes
  useMemo(() => setInvoices(invoices), [invoices, setInvoices]);
  useMemo(() => setSuppliers(suppliers), [suppliers, setSuppliers]);
  useMemo(() => setPaymentsByInvoice(paymentsGrouped), [paymentsGrouped, setPaymentsByInvoice]);
  useMemo(() => setLoading(invoicesQuery.isLoading || paymentsQuery.isLoading), [invoicesQuery.isLoading, paymentsQuery.isLoading, setLoading]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      invoices: [],
      organization: null,
      customers: [],
      suppliers: [],
      payments: {},
      loading: false,
    };
  }

  return {
    invoices,
    organization,
    customers,
    suppliers,
    payments: paymentsGrouped,
    loading: invoicesQuery.isLoading || paymentsQuery.isLoading || customersQuery.isLoading || suppliersQuery.isLoading || organizationQuery.isLoading,
  };
}

export function useInvoiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(invoicesErrorAtom);
  
  const updateInvoiceMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'invoices', 'dummy')
  );
  
  const addInvoiceMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'invoices')
  );

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    setUpdatingStatus(invoiceId);
    try {
      const invoiceRef = doc(db, 'organizations', organizationId, 'invoices', invoiceId);
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
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateInvoiceStatus: async () => {},
      createInvoice: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateInvoiceStatus,
    createInvoice,
    updatingStatus,
  };
}