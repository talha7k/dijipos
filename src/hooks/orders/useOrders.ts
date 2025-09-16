'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderPayment, OrderStatus, TableStatus } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import {
  ordersAtom,
  currentOrderAtom,
  ordersLoadingAtom,
  ordersErrorAtom,
  paymentsAtom,
  ordersRefreshKeyAtom,
  paymentsRefreshKeyAtom
} from '@/store/atoms';



export interface UseOrdersResult {
  // Orders data
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Payments data
  orderPayments: { [orderId: string]: OrderPayment[] };
  paymentsLoading: boolean;
  paymentsError: string | null;
  
  // Selection state
  selectedOrder: Order | null;
  
  // Order CRUD operations
  createOrder: (orderData: Omit<Order, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  
  // Payment operations
  addPayment: (payment: Omit<OrderPayment, 'id' | 'createdAt'>) => Promise<string>;
  updatePayment: (paymentId: string, updates: Partial<OrderPayment>) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  getOrderPayments: (orderId: string) => OrderPayment[];
  getOrderTotalPaid: (orderId: string) => number;
  getOrderRemainingAmount: (orderId: string, orderTotal: number) => number;
  
  // Order management operations
  markOrderAsPaid: (orderId: string) => Promise<boolean>;
  completeOrder: (order: Order) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  
  // Selection operations
  selectOrder: (order: Order | null) => void;
  clearSelection: () => void;
  
  // Utility functions
  refreshOrders: () => void;
  refreshPayments: () => void;
}

export function useOrders(organizationId: string | undefined): UseOrdersResult {
  const { user } = useAuthState();
  
  // Orders state
  const [orders, setOrders] = useAtom(ordersAtom);
  const [selectedOrder, setSelectedOrder] = useAtom(currentOrderAtom);
  const [loading, setLoading] = useAtom(ordersLoadingAtom);
  const [error, setError] = useAtom(ordersErrorAtom);
  
  
  
  // Payments state
  const [orderPayments, setOrderPayments] = useAtom(paymentsAtom);
  const [paymentsLoading, setPaymentsLoading] = useAtom(ordersLoadingAtom); // Reuse orders loading for now
  const [paymentsError, setPaymentsError] = useAtom(ordersErrorAtom); // Reuse orders error for now
  
  // Refresh keys
  const [ordersRefreshKey, setOrdersRefreshKey] = useAtom(ordersRefreshKeyAtom);
  const [paymentsRefreshKey, setPaymentsRefreshKey] = useAtom(paymentsRefreshKeyAtom);

  // Fetch orders
  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setOrders([]);
      return;
    }

    setLoading(true);
    setError(null);

    const ordersQuery = query(collection(db, 'organizations', organizationId, 'orders'));
    const unsubscribe = onSnapshot(ordersQuery, (querySnapshot) => {
      try {
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Order[];
        setOrders(ordersData);
        setLoading(false);
      } catch (err) {
        console.error('Error processing orders:', err);
        setError('Failed to process orders');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId, ordersRefreshKey, setOrders, setLoading, setError]);

  // Keep selectedOrder in sync with updated orders list
  useEffect(() => {
    if (selectedOrder && orders.length > 0) {
      const updatedOrder = orders.find(order => order.id === selectedOrder.id);
      if (updatedOrder && (updatedOrder.updatedAt !== selectedOrder.updatedAt || JSON.stringify(updatedOrder.items) !== JSON.stringify(selectedOrder.items))) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [orders, selectedOrder, setSelectedOrder]);

  

  // Fetch payments
  useEffect(() => {
    if (!organizationId) {
      setPaymentsLoading(false);
      setOrderPayments({});
      return;
    }

    setPaymentsLoading(true);
    setPaymentsError(null);

    const paymentsQuery = query(collection(db, 'organizations', organizationId, 'orderPayments'));
    const unsubscribe = onSnapshot(paymentsQuery, (querySnapshot) => {
      try {
        const paymentsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
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
        setPaymentsLoading(false);
      } catch (err) {
        console.error('Error processing payments:', err);
        setPaymentsError('Failed to process payments');
        setPaymentsLoading(false);
      }
    }, (err) => {
      console.error('Error fetching payments:', err);
      setPaymentsError('Failed to fetch payments');
      setPaymentsLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId, paymentsRefreshKey, setOrderPayments, setPaymentsLoading, setPaymentsError]);

  // Order CRUD operations
  const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const cleanedData = {
        ...orderData,
        customerName: orderData.customerName || null,
        customerPhone: orderData.customerPhone || null,
        tableId: orderData.tableId || null,
        tableName: orderData.tableName || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'orders'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }, [organizationId]);

  const updateOrder = useCallback(async (orderId: string, updates: Partial<Order>): Promise<void> => {
    if (!organizationId) return;

    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }, [organizationId]);

  const deleteOrder = useCallback(async (orderId: string): Promise<void> => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'orders', orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }, [organizationId]);

  // Payment operations
  const addPayment = useCallback(async (payment: Omit<OrderPayment, 'id' | 'createdAt'>): Promise<string> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const paymentData = {
        ...payment,
        organizationId,
        createdAt: Timestamp.now(),
        paymentDate: payment.paymentDate instanceof Date 
          ? Timestamp.fromDate(payment.paymentDate) 
          : (payment.paymentDate ? Timestamp.fromDate(new Date(payment.paymentDate)) : Timestamp.now()),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'orderPayments'), paymentData);
      return docRef.id;
    } catch (err) {
      console.error('Error adding payment:', err);
      throw new Error('Failed to add payment');
    }
  }, [organizationId]);

  const updatePayment = useCallback(async (paymentId: string, updates: Partial<OrderPayment>): Promise<void> => {
    if (!organizationId) throw new Error('Organization ID is required');

    try {
      const updateData: Partial<{
        amount?: number;
        paymentMethod?: string;
        paymentDate?: Timestamp;
        reference?: string;
        notes?: string;
      }> = {};

      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.paymentMethod !== undefined) updateData.paymentMethod = updates.paymentMethod;
      if (updates.reference !== undefined) updateData.reference = updates.reference;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      if (updates.paymentDate instanceof Date) {
        updateData.paymentDate = Timestamp.fromDate(updates.paymentDate);
      } else if (updates.paymentDate) {
        updateData.paymentDate = Timestamp.fromDate(new Date(updates.paymentDate));
      }

      await updateDoc(doc(db, 'organizations', organizationId, 'orderPayments', paymentId), updateData);
    } catch (err) {
      console.error('Error updating payment:', err);
      throw new Error('Failed to update payment');
    }
  }, [organizationId]);

  const deletePayment = useCallback(async (paymentId: string): Promise<void> => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'orderPayments', paymentId));
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }, [organizationId]);

  const getOrderPayments = useCallback((orderId: string): OrderPayment[] => {
    return orderPayments[orderId] || [];
  }, [orderPayments]);

  const getOrderTotalPaid = useCallback((orderId: string): number => {
    const payments = getOrderPayments(orderId);
    return payments.reduce((total, payment) => total + payment.amount, 0);
  }, [getOrderPayments]);

  const getOrderRemainingAmount = useCallback((orderId: string, orderTotal: number): number => {
    const totalPaid = getOrderTotalPaid(orderId);
    return Math.max(0, orderTotal - totalPaid);
  }, [getOrderTotalPaid]);

  // Order management operations
  const markOrderAsPaid = useCallback(async (orderId: string): Promise<boolean> => {
    if (!organizationId || !user) return false;

    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        paid: true,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });
      return true;
    } catch (error) {
      console.error('Error marking order as paid:', error);
      return false;
    }
  }, [organizationId, user]);

  const completeOrder = useCallback(async (order: Order): Promise<boolean> => {
    if (!organizationId || !user) return false;

    // Check if order is paid before completing
    let isPaid = order.paid;
    
    // Fallback: check payments directly if paid field is false
    if (!isPaid) {
      const totalPaid = getOrderTotalPaid(order.id);
      isPaid = totalPaid >= order.total;
    }
    
    if (!isPaid) {
      console.error('Cannot complete an unpaid order');
      return false;
    }

    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', order.id);
      await updateDoc(orderRef, {
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });

      // Release the table if this order has one assigned
      if (order.tableId) {
        const tableRef = doc(db, 'organizations', organizationId, 'tables', order.tableId);
        await updateDoc(tableRef, {
          status: TableStatus.AVAILABLE,
          updatedAt: new Date(),
        });
      }

      return true;
    } catch (error) {
      console.error('Error completing order:', error);
      return false;
    }
  }, [organizationId, user, getOrderTotalPaid]);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus): Promise<boolean> => {
    if (!organizationId || !user) return false;

    // Check if trying to complete an unpaid order
    if (status === OrderStatus.COMPLETED) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        let isPaid = order.paid;
        
        // Fallback: check payments directly if paid field is false
        if (!isPaid) {
          const totalPaid = getOrderTotalPaid(orderId);
          isPaid = totalPaid >= order.total;
        }
        
        if (!isPaid) {
          console.error('Cannot complete an unpaid order');
          return false;
        }
      }
    }

    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: new Date(),
        updatedBy: user.uid,
      });

      // Release table if order is being completed
      if (status === OrderStatus.COMPLETED) {
        const order = orders.find(o => o.id === orderId);
        if (order?.tableId) {
          const tableRef = doc(db, 'organizations', organizationId, 'tables', order.tableId);
          await updateDoc(tableRef, {
            status: TableStatus.AVAILABLE,
            updatedAt: new Date(),
          });
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }, [organizationId, user, orders, getOrderTotalPaid]);

  // Selection operations
  const selectOrder = useCallback((order: Order | null) => {
    setSelectedOrder(order);
  }, [setSelectedOrder]);

  const clearSelection = useCallback(() => {
    setSelectedOrder(null);
  }, [setSelectedOrder]);

  // Refresh functions
  const refreshOrders = useCallback(() => {
    setOrdersRefreshKey(prev => prev + 1);
  }, [setOrdersRefreshKey]);

  const refreshPayments = useCallback(() => {
    setPaymentsRefreshKey(prev => prev + 1);
  }, [setPaymentsRefreshKey]);

  

  // Memoize arrays to prevent unnecessary re-renders
  const memoizedOrders = useMemo(() => orders, [orders]);

  return {
    // Data
    orders: memoizedOrders,
    loading,
    error,
    orderPayments,
    paymentsLoading,
    paymentsError,
    selectedOrder,
    
    // Order CRUD
    createOrder,
    updateOrder,
    deleteOrder,
    
    // Payment operations
    addPayment,
    updatePayment,
    deletePayment,
    getOrderPayments,
    getOrderTotalPaid,
    getOrderRemainingAmount,
    
    // Order management
    markOrderAsPaid,
    completeOrder,
    updateOrderStatus,
    
    // Selection
    selectOrder,
    clearSelection,
    
    // Utilities
    refreshOrders,
    refreshPayments,
  };
}

// Read-only hooks for optimization
export function useOrdersData() {
  return useAtomValue(ordersAtom);
}



export function useOrderPaymentsData() {
  return useAtomValue(paymentsAtom);
}

export function useSelectedOrder() {
  return useAtomValue(currentOrderAtom);
}