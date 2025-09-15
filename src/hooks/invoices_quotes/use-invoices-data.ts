import { useEffect, useState } from 'react';
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

    // Return cleanup function
    return () => {
      invoicesUnsubscribe();
      paymentsUnsubscribe();
    };
  }, [organizationId, setInvoices, setLoading, setSuppliers]);

  return {
    invoices,
    organization,
    customers,
    suppliers,
    payments,
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