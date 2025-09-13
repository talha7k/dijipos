import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export function useOrdersData(organizationId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch orders with real-time updates
    const ordersQ = query(collection(db, 'tenants', organizationId, 'orders'));
    const unsubscribe = onSnapshot(ordersQ, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    orders,
    loading,
  };
}

export function useOrderActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    if (!organizationId) return;

    setUpdatingStatus(orderId);
    try {
      const orderRef = doc(db, 'tenants', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        ...orderData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

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

      const docRef = await addDoc(collection(db, 'tenants', organizationId, 'orders'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'tenants', organizationId, 'orders', orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  return {
    updateOrder,
    createOrder,
    deleteOrder,
    updatingStatus,
  };
}