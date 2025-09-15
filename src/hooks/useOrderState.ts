import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useCallback, useState } from 'react';
import { Order, OrderPayment, OrderStatus, Table, Customer, OrderType, CartItem } from '@/types';
import {
  ordersAtom,
  currentOrderAtom,
  ordersLoadingAtom,
  ordersErrorAtom,
  paymentsAtom,
  cartItemsAtom,
  cartTotalAtom,
  cartLoadingAtom,
  selectedTableAtom,
  selectedCustomerAtom,
  selectedOrderTypeAtom,
  currentViewAtom,
  categoryPathAtom,
  hasOrdersAtom,
  activeOrdersAtom,
  resetPOSStateAtom
} from '@/store/atoms';

export function useOrderState() {
  // Order management state
  const [orders, setOrders] = useAtom(ordersAtom);
  const [selectedOrder, setCurrentOrder] = useAtom(currentOrderAtom);
  const [ordersLoading, setOrdersLoading] = useAtom(ordersLoadingAtom);
  const [ordersError, setOrdersError] = useAtom(ordersErrorAtom);
  const [payments, setPayments] = useAtom(paymentsAtom);

  // POS state
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [cartLoading, setCartLoading] = useAtom(cartLoadingAtom);
  const [selectedTable, setSelectedTable] = useAtom(selectedTableAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom(selectedCustomerAtom);
  const [selectedOrderType, setSelectedOrderType] = useAtom(selectedOrderTypeAtom);
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [categoryPath, setCategoryPath] = useAtom(categoryPathAtom);

  // Computed derived state for async atoms
  const [cartTotal, setCartTotal] = useState(0);
  const [hasItemsInCart, setHasItemsInCart] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [computedSelectedTable, setComputedSelectedTable] = useState<Table | null>(null);
  const [computedSelectedCustomer, setComputedSelectedCustomer] = useState<Customer | null>(null);
  const [computedSelectedOrderType, setComputedSelectedOrderType] = useState<OrderType | null>(null);

  // Other derived state
  const hasOrders = useAtomValue(hasOrdersAtom);
  const activeOrders = useAtomValue(activeOrdersAtom);

  // Update computed derived state when cartItems changes
  useEffect(() => {
    const updateDerivedState = async () => {
      const currentCart = (await cartItems) || [];
      setCartTotal(currentCart.reduce((sum, item) => sum + item.total, 0));
      setHasItemsInCart(currentCart.length > 0);
      setCartItemCount(currentCart.reduce((count, item) => count + (item.quantity || 1), 0));
    };
    updateDerivedState();
  }, [cartItems]);

  // Update computed state for async storage atoms
  useEffect(() => {
    const loadSelectedTable = async () => {
      const table = await selectedTable;
      setComputedSelectedTable(table);
    };
    loadSelectedTable();
  }, [selectedTable]);

  useEffect(() => {
    const loadSelectedCustomer = async () => {
      const customer = await selectedCustomer;
      setComputedSelectedCustomer(customer);
    };
    loadSelectedCustomer();
  }, [selectedCustomer]);

  useEffect(() => {
    const loadSelectedOrderType = async () => {
      const orderType = await selectedOrderType;
      setComputedSelectedOrderType(orderType);
    };
    loadSelectedOrderType();
  }, [selectedOrderType]);

  // Reset POS state
  const resetPOSState = useSetAtom(resetPOSStateAtom);

  // Note: Persistence is now handled automatically by IndexedDB atoms

  // Order management functions
  const addOrder = useCallback((order: Order) => {
    setOrders(prev => [...prev, order]);
  }, [setOrders]);

  const updateOrder = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      )
    );
    
    // Update current order if it's the one being modified
    if (selectedOrder && selectedOrder.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [setOrders, setCurrentOrder, selectedOrder]);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    
    // Clear current order if it's the one being removed
    if (selectedOrder && selectedOrder.id === orderId) {
      setCurrentOrder(null);
    }
  }, [setOrders, setCurrentOrder, selectedOrder]);

  const setCurrentOrderById = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setCurrentOrder(order || null);
  }, [orders, setCurrentOrder]);

  const clearOrders = useCallback(() => {
    setOrders([]);
    setCurrentOrder(null);
  }, [setOrders, setCurrentOrder]);

  // Payment management functions
  const addPayment = useCallback((orderId: string, payment: OrderPayment) => {
    setPayments(prev => ({
      ...prev,
      [orderId]: [...(prev[orderId] || []), payment]
    }));
  }, [setPayments]);

  const updatePayment = useCallback((orderId: string, paymentId: string, updates: Partial<OrderPayment>) => {
    setPayments(prev => ({
      ...prev,
      [orderId]: (prev[orderId] || []).map(payment =>
        payment.id === paymentId ? { ...payment, ...updates } : payment
      )
    }));
  }, [setPayments]);

  const removePayment = useCallback((orderId: string, paymentId: string) => {
    setPayments(prev => ({
      ...prev,
      [orderId]: (prev[orderId] || []).filter(payment => payment.id !== paymentId)
    }));
  }, [setPayments]);

  const getPaymentsForOrder = useCallback((orderId: string) => {
    return payments[orderId] || [];
  }, [payments]);

  // Cart management functions
  const addToCart = useCallback(async (item: CartItem) => {
    const currentCart = (await cartItems) || [];
    const existingItem = currentCart.find(cartItem =>
      cartItem.id === item.id && cartItem.type === item.type
    );

    if (existingItem) {
      const updatedCart = currentCart.map(cartItem =>
        cartItem.id === item.id && cartItem.type === item.type
          ? { 
              ...cartItem, 
              quantity: (cartItem.quantity || 1) + (item.quantity || 1), 
              total: ((cartItem.quantity || 1) + (item.quantity || 1)) * (cartItem.unitPrice || 0)
            }
          : cartItem
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...currentCart, { ...item, quantity: item.quantity || 1 }]);
    }
  }, [cartItems, setCartItems]);

  const updateCartItem = useCallback(async (itemId: string, type: string, updates: Partial<CartItem>) => {
    const currentCart = (await cartItems) || [];
    const updatedCart = currentCart.map(item =>
      item.id === itemId && item.type === type
        ? { ...item, ...updates }
        : item
    );
    setCartItems(updatedCart);
  }, [cartItems, setCartItems]);

  const removeFromCart = useCallback(async (itemId: string, type: string) => {
    const currentCart = (await cartItems) || [];
    const updatedCart = currentCart.filter(item => !(item.id === itemId && item.type === type));
    setCartItems(updatedCart);
  }, [cartItems, setCartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, [setCartItems]);

  const calculateCartTotal = useCallback(async () => {
    const currentCart = (await cartItems) || [];
    return currentCart.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const getCartTotal = useCallback(async () => {
    const currentCart = (await cartItems) || [];
    return currentCart.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  // POS navigation functions
  const navigateToView = useCallback((view: 'items' | 'tables' | 'customers' | 'orders' | 'payment') => {
    setCurrentView(view);
  }, [setCurrentView]);

  const navigateToCategory = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, [setCategoryPath]);

  const clearPOSData = useCallback(() => {
    resetPOSState();
  }, [resetPOSState]);

  // Legacy functions for backward compatibility
  const onOrderSelect = useCallback((order: Order) => {
    setCurrentOrder(order);
  }, [setCurrentOrder]);

  const onPayOrder = useCallback((order: Order) => {
    setCurrentOrder(order);
    setCurrentView('payment');
  }, [setCurrentOrder, setCurrentView]);

  const onBack = useCallback(() => {
    setCurrentView('items');
  }, [setCurrentView]);

  return {
    // Order state
    orders,
    selectedOrder,
    ordersLoading,
    ordersError,
    payments,

    // POS state
    cartItems,
    cartTotal,
    cartLoading,
    selectedTable: computedSelectedTable,
    selectedCustomer: computedSelectedCustomer,
    selectedOrderType: computedSelectedOrderType,
    currentView,
    categoryPath,

    // Derived state
    hasItemsInCart,
    cartItemCount,
    hasOrders,
    activeOrders,

    // Order actions
    setOrders,
    setCurrentOrder,
    setOrdersLoading,
    setOrdersError,
    setPayments,
    addOrder,
    updateOrder,
    removeOrder,
    setCurrentOrderById,
    clearOrders,

    // Payment actions
    addPayment,
    updatePayment,
    removePayment,
    getPaymentsForOrder,

    // Cart actions
    setCartItems,
    setCartLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateCartTotal,
    getCartTotal,

    // POS actions
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setCurrentView,
    setCategoryPath,
    navigateToView,
    navigateToCategory,
    clearPOSData,

    // Legacy functions
    onOrderSelect,
    onPayOrder,
    onBack,
  };
}

// Read-only hooks for optimization
export function useOrders() {
  return useAtomValue(ordersAtom);
}

export function useCurrentOrder() {
  return useAtomValue(currentOrderAtom);
}

export function useCartItems() {
  return useAtomValue(cartItemsAtom);
}

export function useCartTotal() {
  return useAtomValue(cartTotalAtom);
}

export function useSelectedTable() {
  return useAtomValue(selectedTableAtom);
}

export function useSelectedCustomer() {
  return useAtomValue(selectedCustomerAtom);
}

export function useSelectedOrderType() {
  return useAtomValue(selectedOrderTypeAtom);
}

export function useCurrentView() {
  return useAtomValue(currentViewAtom);
}

export function useCategoryPath() {
  return useAtomValue(categoryPathAtom);
}

export function usePayments() {
  return useAtomValue(paymentsAtom);
}