import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrderPayment } from '@/types';

interface UseOrderPaymentsProps {
  organizationId?: string;
}

interface UseOrderPaymentsReturn {
  orderPayments: { [orderId: string]: OrderPayment[] };
  loading: boolean;
  error: string | null;
  addPayment: (payment: Omit<OrderPayment, 'id' | 'createdAt'>) => Promise<string>;
  updatePayment: (paymentId: string, updates: Partial<OrderPayment>) => Promise<void>;
  getOrderPayments: (orderId: string) => OrderPayment[];
  getOrderTotalPaid: (orderId: string) => number;
  getOrderRemainingAmount: (orderId: string, orderTotal: number) => number;
  refreshPayments: () => void;
}

export function useOrderPayments({ organizationId }: UseOrderPaymentsProps): UseOrderPaymentsReturn {
  const [orderPayments, setOrderPayments] = useState<{ [orderId: string]: OrderPayment[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const orderPaymentsQuery = query(
      collection(db, 'organizations', organizationId, 'orderPayments')
    );

    const unsubscribe = onSnapshot(
      orderPaymentsQuery,
      (querySnapshot) => {
        try {
          const paymentsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            // Convert Firestore Timestamp to Date
            const paymentDate = data.paymentDate?.toDate ? data.paymentDate.toDate() : new Date(data.paymentDate);
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            
            return {
              id: doc.id,
              ...data,
              paymentDate,
              createdAt,
            } as OrderPayment;
          });

          // Group payments by orderId
          const paymentsByOrder: { [orderId: string]: OrderPayment[] } = {};
          paymentsData.forEach(payment => {
            if (!paymentsByOrder[payment.orderId]) {
              paymentsByOrder[payment.orderId] = [];
            }
            paymentsByOrder[payment.orderId].push(payment);
          });

          // Sort payments by date for each order
          Object.keys(paymentsByOrder).forEach(orderId => {
            paymentsByOrder[orderId].sort((a, b) => 
              new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
            );
          });

          setOrderPayments(paymentsByOrder);
          setLoading(false);
        } catch (err) {
          console.error('Error processing order payments:', err);
          setError('Failed to process order payments');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching order payments:', err);
        setError('Failed to fetch order payments');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId, refreshKey]);

  const addPayment = useCallback(
    async (payment: Omit<OrderPayment, 'id' | 'createdAt'>): Promise<string> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      try {
        const paymentData = {
          ...payment,
          organizationId,
          createdAt: Timestamp.now(),
          paymentDate: payment.paymentDate instanceof Date 
            ? Timestamp.fromDate(payment.paymentDate) 
            : (payment.paymentDate ? Timestamp.fromDate(new Date(payment.paymentDate)) : Timestamp.now()),
        };

        const docRef = await addDoc(
          collection(db, 'organizations', organizationId, 'orderPayments'),
          paymentData
        );

        return docRef.id;
      } catch (err) {
        console.error('Error adding payment:', err);
        throw new Error('Failed to add payment');
      }
    },
    [organizationId]
  );

  const updatePayment = useCallback(
    async (paymentId: string, updates: Partial<OrderPayment>): Promise<void> => {
      if (!organizationId) {
        throw new Error('Organization ID is required');
      }

      try {
        const updateData: Partial<{
          amount?: number;
          paymentMethod?: string;
          paymentDate?: Timestamp;
          reference?: string;
          notes?: string;
        }> = {};

        // Only include provided fields
        if (updates.amount !== undefined) updateData.amount = updates.amount;
        if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
        if (updates.reference !== undefined) updateData.reference = updates.reference;
        if (updates.notes !== undefined) updateData.notes = updates.notes;
        
        // Convert Date objects to Timestamp if necessary
        if (updates.paymentDate instanceof Date) {
          updateData.paymentDate = Timestamp.fromDate(updates.paymentDate);
        } else if (updates.paymentDate) {
          updateData.paymentDate = Timestamp.fromDate(new Date(updates.paymentDate));
        }

        await updateDoc(
          doc(db, 'organizations', organizationId, 'orderPayments', paymentId),
          updateData
        );
      } catch (err) {
        console.error('Error updating payment:', err);
        throw new Error('Failed to update payment');
      }
    },
    [organizationId]
  );

  const getOrderPayments = useCallback(
    (orderId: string): OrderPayment[] => {
      return orderPayments[orderId] || [];
    },
    [orderPayments]
  );

  const getOrderTotalPaid = useCallback(
    (orderId: string): number => {
      const payments = getOrderPayments(orderId);
      return payments.reduce((total, payment) => total + payment.amount, 0);
    },
    [getOrderPayments]
  );

  const getOrderRemainingAmount = useCallback(
    (orderId: string, orderTotal: number): number => {
      const totalPaid = getOrderTotalPaid(orderId);
      return Math.max(0, orderTotal - totalPaid);
    },
    [getOrderTotalPaid]
  );

  const refreshPayments = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    orderPayments,
    loading,
    error,
    addPayment,
    updatePayment,
    getOrderPayments,
    getOrderTotalPaid,
    getOrderRemainingAmount,
    refreshPayments,
  };
}