import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Order, OrderPayment } from '@/types';

// Collection references
const ordersRef = collection(db, 'orders');

/**
 * Fetch all orders for an organization
 */
export async function getOrders(organizationId: string): Promise<Order[]> {
  try {
    const ordersQuery = query(
      ordersRef,
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getDoc(doc(ordersRef, orderId));
    if (!orderDoc.exists()) {
      return null;
    }

    const data = orderDoc.data();
    return {
      id: orderDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

/**
 * Create a new order
 */
export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(ordersRef, {
      ...filteredData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update an order
 */
export async function updateOrder(orderId: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(ordersRef, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Delete an order and all its payments
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete order document
    batch.delete(doc(ordersRef, orderId));

    // Delete all order payments
    const paymentsRef = collection(doc(ordersRef, orderId), 'payments');
    const paymentsSnapshot = await getDocs(paymentsRef);
    paymentsSnapshot.docs.forEach(paymentDoc => {
      batch.delete(paymentDoc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}

// Order Payments functions

/**
 * Get order payments sub-collection reference
 */
function getOrderPaymentsRef(orderId: string) {
  return collection(doc(ordersRef, orderId), 'payments');
}

/**
 * Fetch all payments for an order
 */
export async function getOrderPayments(orderId: string): Promise<OrderPayment[]> {
  try {
    const paymentsRef = getOrderPaymentsRef(orderId);
    const paymentsQuery = query(paymentsRef, orderBy('paymentDate', 'desc'));
    const snapshot = await getDocs(paymentsQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      paymentDate: doc.data().paymentDate?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as OrderPayment[];
  } catch (error) {
    console.error('Error fetching order payments:', error);
    throw error;
  }
}

/**
 * Add a payment to an order
 */
export async function addOrderPayment(
  orderId: string,
  paymentData: Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>
): Promise<string> {
  try {
    const paymentsRef = getOrderPaymentsRef(orderId);
    const now = Timestamp.now();
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      orderId,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order payment:', error);
    throw error;
  }
}

/**
 * Update an order payment
 */
export async function updateOrderPayment(
  orderId: string,
  paymentId: string,
  updates: Partial<Omit<OrderPayment, 'id' | 'orderId' | 'createdAt'>>
): Promise<void> {
  try {
    const paymentsRef = getOrderPaymentsRef(orderId);
    const paymentDocRef = doc(paymentsRef, paymentId);
    await updateDoc(paymentDocRef, updates);
  } catch (error) {
    console.error('Error updating order payment:', error);
    throw error;
  }
}

/**
 * Delete an order payment
 */
export async function deleteOrderPayment(orderId: string, paymentId: string): Promise<void> {
  try {
    const paymentsRef = getOrderPaymentsRef(orderId);
    await deleteDoc(doc(paymentsRef, paymentId));
  } catch (error) {
    console.error('Error deleting order payment:', error);
    throw error;
  }
}