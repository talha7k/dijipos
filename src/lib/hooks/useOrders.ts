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

  const handleTableStatusUpdate = async (order: Order) => {
    if (!order.tableId) return;

    try {
      if (order.status === OrderStatus.OPEN) {
        await updateTable(order.tableId, { status: TableStatus.OCCUPIED });
      } else if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        await updateTable(order.tableId, { status: TableStatus.AVAILABLE });
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      // Don't throw error here to avoid breaking order operations
    }
  };

  const getOrderById = async (orderId: string): Promise<Order | null> => {
    try {
      return await getOrder(orderId);
    } catch (err) {
      console.error('Error fetching order:', err);
      throw err;
    }
  };

  const createNewOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const orderId = await createOrder(orderData);
      // Real-time listener will automatically update the orders list

      // Update table status if order has a table assigned
      if (orderData.tableId) {
        const order = { ...orderData, id: orderId, createdAt: new Date(), updatedAt: new Date() } as Order;
        await handleTableStatusUpdate(order);
      }

      return orderId;
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  };

  const updateExistingOrder = async (orderId: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await updateOrder(orderId, updates);
      // Real-time listener will automatically update the orders list

      // Update table status if order status or table assignment changed
      if (updates.status || updates.tableId) {
        // Get the updated order to check its current state
        const updatedOrder = await getOrder(orderId);
        if (updatedOrder) {
          await handleTableStatusUpdate(updatedOrder);
        }
      }
    } catch (err) {
      console.error('Error updating order:', err);
      throw err;
    }
  };

  const deleteExistingOrder = async (orderId: string): Promise<void> => {
    try {
      await deleteOrder(orderId);
      // Real-time listener will automatically update the orders list
    } catch (err) {
      console.error('Error deleting order:', err);
      throw err;
    }
  };

  const getPaymentsForOrder = async (orderId: string): Promise<OrderPayment[]> => {
    try {
      return await getOrderPayments(orderId);
    } catch (err) {
      console.error('Error fetching order payments:', err);
      throw err;
    }
  };

  const addPaymentToOrder = async (
    orderId: string,
    paymentData: Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>
  ): Promise<string> => {
    try {
      return await addOrderPayment(orderId, paymentData);
    } catch (err) {
      console.error('Error adding payment to order:', err);
      throw err;
    }
  };

  const updatePaymentInOrder = async (
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
  };

  const deletePaymentFromOrder = async (orderId: string, paymentId: string): Promise<void> => {
    try {
      await deleteOrderPayment(orderId, paymentId);
    } catch (err) {
      console.error('Error deleting order payment:', err);
      throw err;
    }
  };

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