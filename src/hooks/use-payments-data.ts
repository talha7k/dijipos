import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Payment } from '@/types';

export function usePaymentsData(organizationId: string | undefined) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch payments with real-time updates
    const paymentsQ = query(collection(db, 'tenants', organizationId, 'payments'));
    const unsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          organizationId: data.organizationId || '',
          invoiceId: data.invoiceId || '',
          amount: data.amount || 0,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          paymentMethod: data.paymentMethod || '',
          reference: data.reference,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Payment;
      });
      setPayments(paymentsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching payments:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    payments,
    loading,
  };
}