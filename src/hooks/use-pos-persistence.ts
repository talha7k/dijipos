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

// Helper function to get organization-specific storage key
const getOrganizationStorageKey = (baseKey: string, organizationId?: string) => {
  return organizationId ? `${organizationId}_${baseKey}` : baseKey;
};

export const usePOSPersistence = (organizationId?: string) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [currentView, setCurrentView] = useState<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load data from localStorage on mount and when organizationId changes
  useEffect(() => {
    console.log('usePOSPersistence hook running. organizationId:', organizationId);
    if (!organizationId) {
      console.log('No organizationId available, skipping localStorage load');
      return; // Only load if organizationId is available
    }

    // Load cart
    const cartKey = getOrganizationStorageKey(POS_STORAGE_KEYS.CART, organizationId);
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
    const orderTypeKey = `${organizationId}_posOrderType`;
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
    const savedTable = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId));
    if (savedTable) {
      try {
        const parsedTable = JSON.parse(savedTable);
        setSelectedTable(parsedTable);
      } catch (error) {
        console.error('Error loading table from localStorage:', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId));
      }
    }

    // Load selected customer
    const savedCustomer = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId));
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer);
        setSelectedCustomer(parsedCustomer);
      } catch (error) {
        console.error('Error loading customer from localStorage:', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId));
      }
    }

    // Load selected order type (using the standard storage key)
    const savedOrderTypeFromStandardKey = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId));
    if (savedOrderTypeFromStandardKey) {
      try {
        const parsedOrderType = JSON.parse(savedOrderTypeFromStandardKey);
        setSelectedOrderType(parsedOrderType);
      } catch (error) {
        console.error('Error loading order type from localStorage (standard key):', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId));
      }
    }

    // Load current view
    const savedCurrentView = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.VIEW, organizationId));
    if (savedCurrentView) {
      try {
        setCurrentView(savedCurrentView as 'items' | 'tables' | 'customers' | 'orders' | 'payment');
      } catch (error) {
        console.error('Error loading current view from localStorage:', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.VIEW, organizationId));
      }
    }

    // Load category path
    const savedCategoryPath = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, organizationId));
    if (savedCategoryPath) {
      try {
        const parsedCategoryPath = JSON.parse(savedCategoryPath);
        setCategoryPath(parsedCategoryPath);
      } catch (error) {
        console.error('Error loading category path from localStorage:', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, organizationId));
      }
    }

    // Load selected order
    const savedSelectedOrder = localStorage.getItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId));
    if (savedSelectedOrder) {
      try {
        const parsedSelectedOrder = JSON.parse(savedSelectedOrder);
        setSelectedOrder(parsedSelectedOrder);
      } catch (error) {
        console.error('Error loading selected order from localStorage:', error);
        localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId));
      }
    }
  }, [organizationId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    // Only save if cart has items
    if (cart.length === 0) {
      console.log('Cart is empty, skipping save to localStorage');
      return;
    }
    
    const cartKey = getOrganizationStorageKey(POS_STORAGE_KEYS.CART, organizationId);
    console.log('Saving cart to localStorage with key:', cartKey);
    console.log('Cart data:', cart);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    console.log('Cart saved to localStorage. Verification:', localStorage.getItem(cartKey));
  }, [cart, organizationId]);

  // Save order type to localStorage whenever it changes
  useEffect(() => {
    if (!selectedOrderType || !organizationId) return;
    
    // Save to both the custom key and the standard key for compatibility
    const orderTypeKey = `${organizationId}_posOrderType`;
    const standardOrderTypeKey = getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId);
    
    console.log('Saving order type to localStorage with key:', orderTypeKey);
    console.log('Order type data:', selectedOrderType);
    localStorage.setItem(orderTypeKey, JSON.stringify(selectedOrderType));
    localStorage.setItem(standardOrderTypeKey, JSON.stringify(selectedOrderType));
    console.log('Order type saved to localStorage. Verification:', localStorage.getItem(orderTypeKey));
  }, [selectedOrderType, organizationId]);

  useEffect(() => {
    if (selectedTable) {
      localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId), JSON.stringify(selectedTable));
    } else {
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId));
    }
  }, [selectedTable, organizationId]);

  useEffect(() => {
    if (selectedCustomer) {
      localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId), JSON.stringify(selectedCustomer));
    } else {
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId));
    }
  }, [selectedCustomer, organizationId]);

  useEffect(() => {
    if (selectedOrderType) {
      localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId), JSON.stringify(selectedOrderType));
    } else {
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId));
    }
  }, [selectedOrderType, organizationId]);

  useEffect(() => {
    localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.VIEW, organizationId), currentView);
  }, [currentView, organizationId]);

  useEffect(() => {
    localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, organizationId), JSON.stringify(categoryPath));
  }, [categoryPath, organizationId]);

  useEffect(() => {
    if (selectedOrder) {
      localStorage.setItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId), JSON.stringify(selectedOrder));
    } else {
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId));
    }
  }, [selectedOrder, organizationId]);

  // Clear all POS data
  const clearPOSData = () => {
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CART, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.VIEW, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, organizationId));
    localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId));
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
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CART, organizationId));
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.TABLE, organizationId));
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CUSTOMER, organizationId));
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.CATEGORY_PATH, organizationId));
      localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER, organizationId));
      // Don't remove order type from localStorage
      // localStorage.removeItem(getOrganizationStorageKey(POS_STORAGE_KEYS.ORDER_TYPE, organizationId));
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