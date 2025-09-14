'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Order, OrderPayment, OrderStatus, Table, Customer, OrderType } from "@/types";

export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface OrderContextType {
  // State
  orders: Order[];
  payments: { [orderId: string]: OrderPayment[] };
  cart: CartItem[];
  selectedTable: Table | null;
  selectedCustomer: Customer | null;
  selectedOrderType: OrderType | null;
  selectedOrder: Order | null;
  currentView: 'items' | 'tables' | 'customers' | 'orders' | 'payment';
  categoryPath: string[];
  organizationId: string | undefined;

  // Actions
  setOrders: (orders: Order[]) => void;
  setPayments: (payments: { [orderId: string]: OrderPayment[] }) => void;
  setCart: (cart: CartItem[]) => void;
  setSelectedTable: (table: Table | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedOrderType: (orderType: OrderType | null) => void;
  setSelectedOrder: (order: Order | null) => void;
  setCurrentView: (view: 'items' | 'tables' | 'customers' | 'orders' | 'payment') => void;
  setCategoryPath: (path: string[]) => void;

  // Utility functions
  addToCart: (item: CartItem) => void;
  updateCartItem: (itemId: string, type: 'product' | 'service', updates: Partial<CartItem>) => void;
  removeFromCart: (itemId: string, type: 'product' | 'service') => void;
  clearCart: () => void;
  clearPOSData: () => void;
  getCartTotal: () => number;

  // Legacy functions for backward compatibility
  onOrderSelect: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onBack: () => void;
  onOrderUpdate?: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Storage keys
const ORDER_STORAGE_KEYS = {
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  CART: 'cart',
  SELECTED_TABLE: 'selectedTable',
  SELECTED_CUSTOMER: 'selectedCustomer',
  SELECTED_ORDER_TYPE: 'selectedOrderType',
  SELECTED_ORDER: 'selectedOrder',
  CURRENT_VIEW: 'currentView',
  CATEGORY_PATH: 'categoryPath',
};

// Helper function to get organization-specific storage key
const getStorageKey = (baseKey: string, organizationId?: string) => {
  return organizationId ? `${organizationId}_${baseKey}` : baseKey;
};

export function OrderProvider({
  children,
  organizationId
}: {
  children: ReactNode;
  organizationId?: string;
}) {
  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<{ [orderId: string]: OrderPayment[] }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentView, setCurrentView] = useState<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
  const [categoryPath, setCategoryPath] = useState<string[]>([]);

  // Load data from localStorage on mount and when organizationId changes
  useEffect(() => {
    if (!organizationId) return;

    // Load orders
    const ordersKey = getStorageKey(ORDER_STORAGE_KEYS.ORDERS, organizationId);
    const savedOrders = localStorage.getItem(ordersKey);
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        localStorage.removeItem(ordersKey);
      }
    }

    // Load payments
    const paymentsKey = getStorageKey(ORDER_STORAGE_KEYS.PAYMENTS, organizationId);
    const savedPayments = localStorage.getItem(paymentsKey);
    if (savedPayments) {
      try {
        setPayments(JSON.parse(savedPayments));
      } catch (error) {
        console.error('Error loading payments from localStorage:', error);
        localStorage.removeItem(paymentsKey);
      }
    }

    // Load cart
    const cartKey = getStorageKey(ORDER_STORAGE_KEYS.CART, organizationId);
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(cartKey);
      }
    }

    // Load selected table
    const tableKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_TABLE, organizationId);
    const savedTable = localStorage.getItem(tableKey);
    if (savedTable) {
      try {
        setSelectedTable(JSON.parse(savedTable));
      } catch (error) {
        console.error('Error loading selected table from localStorage:', error);
        localStorage.removeItem(tableKey);
      }
    }

    // Load selected customer
    const customerKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_CUSTOMER, organizationId);
    const savedCustomer = localStorage.getItem(customerKey);
    if (savedCustomer) {
      try {
        setSelectedCustomer(JSON.parse(savedCustomer));
      } catch (error) {
        console.error('Error loading selected customer from localStorage:', error);
        localStorage.removeItem(customerKey);
      }
    }

    // Load selected order type
    const orderTypeKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_ORDER_TYPE, organizationId);
    const savedOrderType = localStorage.getItem(orderTypeKey);
    if (savedOrderType) {
      try {
        setSelectedOrderType(JSON.parse(savedOrderType));
      } catch (error) {
        console.error('Error loading selected order type from localStorage:', error);
        localStorage.removeItem(orderTypeKey);
      }
    }

    // Load selected order
    const selectedOrderKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_ORDER, organizationId);
    const savedSelectedOrder = localStorage.getItem(selectedOrderKey);
    if (savedSelectedOrder) {
      try {
        setSelectedOrder(JSON.parse(savedSelectedOrder));
      } catch (error) {
        console.error('Error loading selected order from localStorage:', error);
        localStorage.removeItem(selectedOrderKey);
      }
    }

    // Load current view
    const viewKey = getStorageKey(ORDER_STORAGE_KEYS.CURRENT_VIEW, organizationId);
    const savedView = localStorage.getItem(viewKey);
    if (savedView) {
      try {
        setCurrentView(savedView as 'items' | 'tables' | 'customers' | 'orders' | 'payment');
      } catch (error) {
        console.error('Error loading current view from localStorage:', error);
        localStorage.removeItem(viewKey);
      }
    }

    // Load category path
    const categoryPathKey = getStorageKey(ORDER_STORAGE_KEYS.CATEGORY_PATH, organizationId);
    const savedCategoryPath = localStorage.getItem(categoryPathKey);
    if (savedCategoryPath) {
      try {
        setCategoryPath(JSON.parse(savedCategoryPath));
      } catch (error) {
        console.error('Error loading category path from localStorage:', error);
        localStorage.removeItem(categoryPathKey);
      }
    }
  }, [organizationId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!organizationId) return;
    const ordersKey = getStorageKey(ORDER_STORAGE_KEYS.ORDERS, organizationId);
    localStorage.setItem(ordersKey, JSON.stringify(orders));
  }, [orders, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const paymentsKey = getStorageKey(ORDER_STORAGE_KEYS.PAYMENTS, organizationId);
    localStorage.setItem(paymentsKey, JSON.stringify(payments));
  }, [payments, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const cartKey = getStorageKey(ORDER_STORAGE_KEYS.CART, organizationId);
    if (cart.length > 0) {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } else {
      localStorage.removeItem(cartKey);
    }
  }, [cart, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const tableKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_TABLE, organizationId);
    if (selectedTable) {
      localStorage.setItem(tableKey, JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem(tableKey);
    }
  }, [selectedTable, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const customerKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_CUSTOMER, organizationId);
    if (selectedCustomer) {
      localStorage.setItem(customerKey, JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem(customerKey);
    }
  }, [selectedCustomer, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const orderTypeKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_ORDER_TYPE, organizationId);
    if (selectedOrderType) {
      localStorage.setItem(orderTypeKey, JSON.stringify(selectedOrderType));
    } else {
      localStorage.removeItem(orderTypeKey);
    }
  }, [selectedOrderType, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const selectedOrderKey = getStorageKey(ORDER_STORAGE_KEYS.SELECTED_ORDER, organizationId);
    if (selectedOrder) {
      localStorage.setItem(selectedOrderKey, JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem(selectedOrderKey);
    }
  }, [selectedOrder, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const viewKey = getStorageKey(ORDER_STORAGE_KEYS.CURRENT_VIEW, organizationId);
    localStorage.setItem(viewKey, currentView);
  }, [currentView, organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    const categoryPathKey = getStorageKey(ORDER_STORAGE_KEYS.CATEGORY_PATH, organizationId);
    localStorage.setItem(categoryPathKey, JSON.stringify(categoryPath));
  }, [categoryPath, organizationId]);

  // Cart utility functions
  const addToCart = useCallback((item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem =>
        cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity, total: (cartItem.quantity + item.quantity) * cartItem.price }
            : cartItem
        );
      } else {
        return [...prevCart, item];
      }
    });
  }, [setCart]);

  const updateCartItem = useCallback((itemId: string, type: 'product' | 'service', updates: Partial<CartItem>) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId && item.type === type
          ? { ...item, ...updates }
          : item
      )
    );
  }, [setCart]);

  const removeFromCart = useCallback((itemId: string, type: 'product' | 'service') => {
    setCart(prevCart => prevCart.filter(item => !(item.id === itemId && item.type === type)));
  }, [setCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const clearPOSData = useCallback(() => {
    setCart([]);
    setSelectedTable(null);
    setSelectedCustomer(null);
    // Don't clear order type - preserve user preference
    setCurrentView('items');
    setCategoryPath([]);
    setSelectedOrder(null);
  }, [setCart, setSelectedTable, setSelectedCustomer, setCurrentView, setCategoryPath, setSelectedOrder]);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  }, [cart]);

  // Legacy functions for backward compatibility
  const onOrderSelect = useCallback((order: Order) => {
    setSelectedOrder(order);
  }, [setSelectedOrder]);

  const onPayOrder = useCallback((order: Order) => {
    setSelectedOrder(order);
    setCurrentView('payment');
  }, [setSelectedOrder, setCurrentView]);

  const onBack = useCallback(() => {
    setCurrentView('items');
  }, [setCurrentView]);

  const value: OrderContextType = {
    // State
    orders,
    payments,
    cart,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    currentView,
    categoryPath,
    organizationId,

    // Actions
    setOrders,
    setPayments,
    setCart,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setSelectedOrder,
    setCurrentView,
    setCategoryPath,

    // Utility functions
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    clearPOSData,
    getCartTotal,

    // Legacy functions
    onOrderSelect,
    onPayOrder,
    onBack,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderContext() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
}