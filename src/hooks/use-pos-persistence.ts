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

// Helper function to get tenant-specific storage key
const getTenantStorageKey = (baseKey: string, tenantId?: string) => {
  return tenantId ? `${tenantId}_${baseKey}` : baseKey;
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
    console.log('usePOSPersistence hook running. tenantId:', tenantId);
    if (!tenantId) {
      console.log('No tenantId available, skipping localStorage load');
      return; // Only load if tenantId is available
    }

    // Load cart
    const cartKey = getTenantStorageKey(POS_STORAGE_KEYS.CART, tenantId);
    console.log('Looking for cart with key:', cartKey);
    const savedCart = localStorage.getItem(cartKey);
    console.log('Loading cart from localStorage:', savedCart);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed cart:', parsedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem(cartKey);
      }
    } else {
      console.log('No cart found in localStorage with key:', cartKey);
    }

    // Load order type
    const orderTypeKey = `${tenantId}_posOrderType`;
    console.log('Looking for order type with key:', orderTypeKey);
    const savedOrderType = localStorage.getItem(orderTypeKey);
    console.log('Loading order type from localStorage:', savedOrderType);
    if (savedOrderType) {
      try {
        const parsedOrderType = JSON.parse(savedOrderType);
        console.log('Parsed order type:', parsedOrderType);
        setSelectedOrderType(parsedOrderType);
      } catch (error) {
        console.error('Error loading order type from localStorage:', error);
        localStorage.removeItem(orderTypeKey);
      }
    } else {
      console.log('No order type found in localStorage with key:', orderTypeKey);
    }

    // Load selected table
    const savedTable = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId));
    if (savedTable) {
      try {
        const parsedTable = JSON.parse(savedTable);
        setSelectedTable(parsedTable);
      } catch (error) {
        console.error('Error loading table from localStorage:', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId));
      }
    }

    // Load selected customer
    const savedCustomer = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId));
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer);
        setSelectedCustomer(parsedCustomer);
      } catch (error) {
        console.error('Error loading customer from localStorage:', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId));
      }
    }

    // Load selected order type (using the standard storage key)
    const savedOrderTypeFromStandardKey = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId));
    if (savedOrderTypeFromStandardKey) {
      try {
        const parsedOrderType = JSON.parse(savedOrderTypeFromStandardKey);
        setSelectedOrderType(parsedOrderType);
      } catch (error) {
        console.error('Error loading order type from localStorage (standard key):', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId));
      }
    }

    // Load current view
    const savedCurrentView = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.VIEW, tenantId));
    if (savedCurrentView) {
      try {
        setCurrentView(savedCurrentView as 'items' | 'tables' | 'customers' | 'orders' | 'payment');
      } catch (error) {
        console.error('Error loading current view from localStorage:', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.VIEW, tenantId));
      }
    }

    // Load category path
    const savedCategoryPath = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, tenantId));
    if (savedCategoryPath) {
      try {
        const parsedCategoryPath = JSON.parse(savedCategoryPath);
        setCategoryPath(parsedCategoryPath);
      } catch (error) {
        console.error('Error loading category path from localStorage:', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, tenantId));
      }
    }

    // Load selected order
    const savedSelectedOrder = localStorage.getItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId));
    if (savedSelectedOrder) {
      try {
        const parsedSelectedOrder = JSON.parse(savedSelectedOrder);
        setSelectedOrder(parsedSelectedOrder);
      } catch (error) {
        console.error('Error loading selected order from localStorage:', error);
        localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId));
      }
    }
  }, [tenantId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    // Only save if cart has items
    if (cart.length === 0) {
      console.log('Cart is empty, skipping save to localStorage');
      return;
    }
    
    const cartKey = getTenantStorageKey(POS_STORAGE_KEYS.CART, tenantId);
    console.log('Saving cart to localStorage with key:', cartKey);
    console.log('Cart data:', cart);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log('Cart saved to localStorage. Verification:', localStorage.getItem(cartKey));
  }, [cart, tenantId]);

  // Save order type to localStorage whenever it changes
  useEffect(() => {
    if (!selectedOrderType || !tenantId) return;
    
    // Save to both the custom key and the standard key for compatibility
    const orderTypeKey = `${tenantId}_posOrderType`;
    const standardOrderTypeKey = getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId);
    
    console.log('Saving order type to localStorage with key:', orderTypeKey);
    console.log('Order type data:', selectedOrderType);
    localStorage.setItem(orderTypeKey, JSON.stringify(selectedOrderType));
    localStorage.setItem(standardOrderTypeKey, JSON.stringify(selectedOrderType));
    console.log('Order type saved to localStorage. Verification:', localStorage.getItem(orderTypeKey));
  }, [selectedOrderType, tenantId]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId), JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId));
    }
  }, [selectedTable, tenantId]);

  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId), JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId));
    }
  }, [selectedCustomer, tenantId]);

  useEffect(() => {
    if (selectedOrderType) {
      localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId), JSON.stringify(selectedOrderType));
    } else {
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId));
    }
  }, [selectedOrderType, tenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.VIEW, tenantId), currentView);
  }, [currentView, tenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, tenantId), JSON.stringify(categoryPath));
  }, [categoryPath, tenantId]);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId), JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId));
    }
  }, [selectedOrder, tenantId]);

  // Clear all POS data
  const clearPOSData = () => {
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CART, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.VIEW, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, tenantId));
    localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId));
  };

  // Clear cart with confirmation
  const clearCart = () => {
    if (cart.length === 0) return;

    if (confirm('Are you sure you want to clear the cart? This action cannot be undone.')) {
      setCart([]);
      setSelectedTable(null);
      setSelectedCustomer(null);
      // Don't clear the order type as requested
      // setSelectedOrderType(null);
      setCategoryPath([]);
      setSelectedOrder(null);
      
      // Explicitly clear cart from localStorage but preserve order type
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CART, tenantId));
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.TABLE, tenantId));
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CUSTOMER, tenantId));
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, tenantId));
      localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER, tenantId));
      // Don't remove order type from localStorage
      // localStorage.removeItem(getTenantStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, tenantId));
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