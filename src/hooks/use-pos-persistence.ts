import { useState, useEffect } from 'react';
import { Table, Customer, Order, OrderType } from '@/types';

export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface POSState {
  cart: CartItem[];
  selectedTable: Table | null;
  selectedCustomer: Customer | null;
  selectedOrderType: OrderType | null;
  currentView: 'items' | 'tables' | 'customers' | 'orders' | 'payment';
  categoryPath: string[];
  selectedOrder: Order | null;
}

const POS_STORAGE_KEYS = {
  CART: 'posCart',
  TABLE: 'posSelectedTable',
  CUSTOMER: 'posSelectedCustomer',
  ORDER_TYPE: 'posSelectedOrderType',
  VIEW: 'posCurrentView',
  CATEGORY_PATH: 'posCategoryPath',
  ORDER: 'posSelectedOrder',
};

export const usePOSPersistence = (tenantId?: string) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [currentView, setCurrentView] = useState<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load data from localStorage on mount and when tenantId changes
  useEffect(() => {
    if (!tenantId) return; // Only load if tenantId is available

    // Load cart
    const savedCart = localStorage.getItem(POS_STORAGE_KEYS.CART);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.CART);
      }
    }

    // Load selected table
    const savedTable = localStorage.getItem(POS_STORAGE_KEYS.TABLE);
    if (savedTable) {
      try {
        const parsedTable = JSON.parse(savedTable);
        setSelectedTable(parsedTable);
      } catch (error) {
        console.error('Error loading table from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.TABLE);
      }
    }

    // Load selected customer
    const savedCustomer = localStorage.getItem(POS_STORAGE_KEYS.CUSTOMER);
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer);
        setSelectedCustomer(parsedCustomer);
      } catch (error) {
        console.error('Error loading customer from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.CUSTOMER);
      }
    }

    // Load selected order type
    const savedOrderType = localStorage.getItem(POS_STORAGE_KEYS.ORDER_TYPE);
    if (savedOrderType) {
      try {
        const parsedOrderType = JSON.parse(savedOrderType);
        setSelectedOrderType(parsedOrderType);
      } catch (error) {
        console.error('Error loading order type from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.ORDER_TYPE);
      }
    }

    // Load current view
    const savedCurrentView = localStorage.getItem(POS_STORAGE_KEYS.VIEW);
    if (savedCurrentView) {
      try {
        setCurrentView(savedCurrentView as 'items' | 'tables' | 'customers' | 'orders' | 'payment');
      } catch (error) {
        console.error('Error loading current view from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.VIEW);
      }
    }

    // Load category path
    const savedCategoryPath = localStorage.getItem(POS_STORAGE_KEYS.CATEGORY_PATH);
    if (savedCategoryPath) {
      try {
        const parsedCategoryPath = JSON.parse(savedCategoryPath);
        setCategoryPath(parsedCategoryPath);
      } catch (error) {
        console.error('Error loading category path from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.CATEGORY_PATH);
      }
    }

    // Load selected order
    const savedSelectedOrder = localStorage.getItem(POS_STORAGE_KEYS.ORDER);
    if (savedSelectedOrder) {
      try {
        const parsedSelectedOrder = JSON.parse(savedSelectedOrder);
        setSelectedOrder(parsedSelectedOrder);
      } catch (error) {
        console.error('Error loading selected order from localStorage:', error);
        localStorage.removeItem(POS_STORAGE_KEYS.ORDER);
      }
    }
  }, [tenantId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(POS_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem(POS_STORAGE_KEYS.TABLE, JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem(POS_STORAGE_KEYS.TABLE);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem(POS_STORAGE_KEYS.CUSTOMER, JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem(POS_STORAGE_KEYS.CUSTOMER);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (selectedOrderType) {
      localStorage.setItem(POS_STORAGE_KEYS.ORDER_TYPE, JSON.stringify(selectedOrderType));
    } else {
      localStorage.removeItem(POS_STORAGE_KEYS.ORDER_TYPE);
    }
  }, [selectedOrderType]);

  useEffect(() => {
    localStorage.setItem(POS_STORAGE_KEYS.VIEW, currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem(POS_STORAGE_KEYS.CATEGORY_PATH, JSON.stringify(categoryPath));
  }, [categoryPath]);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem(POS_STORAGE_KEYS.ORDER, JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem(POS_STORAGE_KEYS.ORDER);
    }
  }, [selectedOrder]);

  // Clear all POS data
  const clearPOSData = () => {
    localStorage.removeItem(POS_STORAGE_KEYS.CART);
    localStorage.removeItem(POS_STORAGE_KEYS.TABLE);
    localStorage.removeItem(POS_STORAGE_KEYS.CUSTOMER);
    localStorage.removeItem(POS_STORAGE_KEYS.ORDER_TYPE);
    localStorage.removeItem(POS_STORAGE_KEYS.VIEW);
    localStorage.removeItem(POS_STORAGE_KEYS.CATEGORY_PATH);
    localStorage.removeItem(POS_STORAGE_KEYS.ORDER);
  };

  // Clear cart with confirmation
  const clearCart = () => {
    if (cart.length === 0) return;

    if (confirm('Are you sure you want to clear the cart? This action cannot be undone.')) {
      setCart([]);
      setSelectedTable(null);
      setSelectedCustomer(null);
      setSelectedOrderType(null);
      setCategoryPath([]);
      setSelectedOrder(null);
    }
  };

  // Get current POS state
  const getPOSState = (): POSState => ({
    cart,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    currentView,
    categoryPath,
    selectedOrder,
  });

  return {
    // State
    cart,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    currentView,
    categoryPath,
    selectedOrder,

    // Setters
    setCart,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setCurrentView,
    setCategoryPath,
    setSelectedOrder,

    // Utilities
    clearPOSData,
    clearCart,
    getPOSState,
  };
};