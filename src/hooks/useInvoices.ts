import { useEffect, useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot, updateDoc, doc, getDoc, addDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Invoice, Organization, Customer, Supplier, Payment } from '@/types';
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

// Global singletons to prevent duplicate listeners
const globalInvoiceListeners = new Map<string, {
  invoicesUnsubscribe: () => void;
  paymentsUnsubscribe: () => void;
  refCount: number;
}>();

export function useInvoicesData(organizationId: string | undefined) {
  const [invoices, setInvoices] = useAtom(invoicesAtom);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useAtom(suppliersAtom);
  const [payments, setPayments] = useState<{ [invoiceId: string]: Payment[] }>({});
  const [loading, setLoading] = useAtom(invoicesLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setInvoices([]);
      return;
    }

    const listenerKey = `invoices-${organizationId}`;
    
    // Check if listeners already exist
    if (globalInvoiceListeners.has(listenerKey)) {
      const existing = globalInvoiceListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.invoicesUnsubscribe();
          existing.paymentsUnsubscribe();
          globalInvoiceListeners.delete(listenerKey);
        }
      };
    }

    // Create new listeners
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

    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const customersSnapshot = await getDocs(collection(db, 'organizations', organizationId, 'customers'));
        const customersData = customersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Customer[];
        setCustomers(customersData);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    // Fetch suppliers
    const fetchSuppliers = async () => {
      try {
        const suppliersSnapshot = await getDocs(collection(db, 'organizations', organizationId, 'suppliers'));
        const suppliersData = suppliersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Supplier[];
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };

    // Fetch payments with real-time updates
    const paymentsQ = query(collection(db, 'organizations', organizationId, 'payments'));
    const paymentsUnsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => ({
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
      setPayments(paymentsByInvoice);
    }, (error) => {
      console.error('Error fetching payments:', error);
    });

    // Fetch invoices with real-time updates
    const invoicesQ = query(collection(db, 'organizations', organizationId, 'invoices'));
    const invoicesUnsubscribe = onSnapshot(invoicesQ, (querySnapshot) => {
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
      console.error('Error fetching invoices:', error);
      setLoading(false);
    });

    // Execute all fetch operations
    fetchOrganization();
    fetchCustomers();
    fetchSuppliers();

    // Store in global singleton
    globalInvoiceListeners.set(listenerKey, {
      invoicesUnsubscribe,
      paymentsUnsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalInvoiceListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.invoicesUnsubscribe();
          listener.paymentsUnsubscribe();
          globalInvoiceListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId, setInvoices, setLoading, setSuppliers]);

  const invoicesMemo = useMemo(() => invoices, [invoices]);
  const customersMemo = useMemo(() => customers, [customers]);
  const suppliersMemo = useMemo(() => suppliers, [suppliers]);
  const paymentsMemo = useMemo(() => payments, [payments]);

  return {
    invoices: invoicesMemo,
    organization,
    customers: customersMemo,
    suppliers: suppliersMemo,
    payments: paymentsMemo,
    loading,
  };
}

export function useInvoiceActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(invoicesErrorAtom);

  const updateInvoiceStatus = async (invoiceId: string, status: Invoice['status']) => {
    if (!organizationId) return;

    setUpdatingStatus(invoiceId);
    try {
      const invoiceRef = doc(db, 'organizations', organizationId, 'invoices', invoiceId);
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
      await addDoc(collection(db, 'organizations', organizationId, 'invoices'), cleanedData);
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  };

  return {
    updateInvoiceStatus,
    createInvoice,
    updatingStatus,
  };
}