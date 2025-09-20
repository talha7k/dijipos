import { useCallback } from 'react';
import { Order, OrderPayment } from '@/types';
import { OrderStatus, TableStatus } from '@/types/enums';
import {
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderPayments,
  addOrderPayment,
  updateOrderPayment,
  deleteOrderPayment
} from '../firebase/firestore/orders';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { useTables } from './useTables';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

interface OrdersActions {
  getOrderById: (orderId: string) => Promise<Order | null>;
  createNewOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingOrder: (orderId: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingOrder: (orderId: string) => Promise<void>;
  getPaymentsForOrder: (orderId: string) => Promise<OrderPayment[]>;
  addPaymentToOrder: (orderId: string, paymentData: Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>) => Promise<string>;
  updatePaymentInOrder: (orderId: string, paymentId: string, updates: Partial<Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>>) => Promise<void>;
  deletePaymentFromOrder: (orderId: string, paymentId: string) => Promise<void>;
}

/**
 * Hook that provides real-time order stream with interactions for the selected organization
 */
export function useOrders(): OrdersState & OrdersActions {
  const { selectedOrganization } = useOrganization();
  const { updateTable } = useTables();

  const { data: orders, loading, error } = useRealtimeCollection<Order>(
    'orders',
    selectedOrganization?.id || null,
    [], // additional constraints remove this line later for indexes to be used.
    null // disable orderBy to prevent index issues remove this line later for indexes to be used.
  );

  const handleTableStatusUpdate = useCallback(async (oldOrder: Order | null, newOrder: Order) => {
    try {
      const oldTableId = oldOrder?.tableId;
      const newTableId = newOrder.tableId;

      // If table assignment hasn't changed, only update based on order status
      if (oldTableId === newTableId) {
        if (!newTableId) return; // No table assigned

        if (newOrder.status === OrderStatus.OPEN) {
          await updateTable(newTableId, { status: TableStatus.OCCUPIED });
        } else if (newOrder.status === OrderStatus.COMPLETED || newOrder.status === OrderStatus.CANCELLED) {
          await updateTable(newTableId, { status: TableStatus.AVAILABLE });
        }
        return;
      }

      // Table assignment has changed - handle old and new tables

      // Free up the old table if it exists
      if (oldTableId) {
        await updateTable(oldTableId, { status: TableStatus.AVAILABLE });
      }

      // Set the new table status based on order status
      if (newTableId) {
        const newStatus = newOrder.status === OrderStatus.OPEN ? TableStatus.OCCUPIED : TableStatus.AVAILABLE;
        await updateTable(newTableId, { status: newStatus });
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      // Don't throw error here to avoid breaking order operations
    }
  }, [updateTable]);

  const getOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    try {
      return await getOrder(orderId);
    } catch (err) {
      console.error('Error fetching order:', err);
      throw err;
    }
  }, []);

  const createNewOrder = useCallback(async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const orderId = await createOrder(orderData);
      // Real-time listener will automatically update the orders list

      // Update table status if order has a table assigned
      const newOrder = { ...orderData, id: orderId, createdAt: new Date(), updatedAt: new Date() } as Order;
      await handleTableStatusUpdate(null, newOrder);

      return orderId;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }, [handleTableStatusUpdate]);

  const updateExistingOrder = useCallback(async (orderId: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      // Get the old order before updating
      const oldOrder = await getOrder(orderId);
      if (!oldOrder) {
        throw new Error(`Order with ID ${orderId} not found`);
      }

      await updateOrder(orderId, updates);
      // Real-time listener will automatically update the orders list

      // Update table status if order status or table assignment changed
      if (updates.status !== undefined || updates.tableId !== undefined) {
        // Get the updated order to check its current state
        const updatedOrder = await getOrder(orderId);
        if (updatedOrder) {
          await handleTableStatusUpdate(oldOrder, updatedOrder);
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  }, [handleTableStatusUpdate]);

  const deleteExistingOrder = useCallback(async (orderId: string): Promise<void> => {
    try {
      // Get the order before deleting to free up its table if needed
      const orderToDelete = await getOrder(orderId);
      if (orderToDelete && orderToDelete.status === OrderStatus.OPEN && orderToDelete.tableId) {
        await updateTable(orderToDelete.tableId, { status: TableStatus.AVAILABLE });
      }

      await deleteOrder(orderId);
      // Real-time listener will automatically update the orders list
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  }, [updateTable]);

  const getPaymentsForOrder = useCallback(async (orderId: string): Promise<OrderPayment[]> => {
    try {
      return await getOrderPayments(orderId);
    } catch (err) {
      console.error('Error fetching order payments:', err);
      throw err;
    }
  }, []);

  const addPaymentToOrder = useCallback(async (
    orderId: string,
    paymentData: Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>
  ): Promise<string> => {
    try {
      return await addOrderPayment(orderId, paymentData);
    } catch (err) {
      console.error('Error adding payment to order:', err);
      throw err;
    }
  }, []);

  const updatePaymentInOrder = useCallback(async (
    orderId: string,
    paymentId: string,
    updates: Partial<Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>>
  ): Promise<void> => {
    try {
      await updateOrderPayment(orderId, paymentId, updates);
    } catch (err) {
      console.error('Error updating order payment:', err);
      throw err;
    }
  }, []);

  const deletePaymentFromOrder = useCallback(async (orderId: string, paymentId: string): Promise<void> => {
    try {
      await deleteOrderPayment(orderId, paymentId);
    } catch (err) {
      console.error('Error deleting order payment:', err);
      throw err;
    }
  }, []);

  return {
    orders,
    loading,
    error,
    getOrderById,
    createNewOrder,
    updateExistingOrder,
    deleteExistingOrder,
    getPaymentsForOrder,
    addPaymentToOrder,
    updatePaymentInOrder,
    deletePaymentFromOrder,
  };
}