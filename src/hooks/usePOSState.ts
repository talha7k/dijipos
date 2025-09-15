import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { OrderItem, Table, OrderType } from '@/types/order';
import { Customer } from '@/types/customer-supplier';
import {
  cartItemsAtom,
  cartTotalAtom,
  cartLoadingAtom,
  selectedTableAtom,
  selectedCustomerAtom,
  selectedOrderTypeAtom,
  currentViewAtom,
  categoryPathAtom,
  hasItemsInCartAtom,
  cartItemCountAtom,
  resetPOSStateAtom
} from '@/store/atoms';

export function usePOSState() {
  // Cart state
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [cartTotal, setCartTotal] = useAtom(cartTotalAtom);
  const [cartLoading, setCartLoading] = useAtom(cartLoadingAtom);

  // Selection state
  const [selectedTable, setSelectedTable] = useAtom(selectedTableAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom(selectedCustomerAtom);
  const [selectedOrderType, setSelectedOrderType] = useAtom(selectedOrderTypeAtom);

  // Navigation state
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [categoryPath, setCategoryPath] = useAtom(categoryPathAtom);

  // Derived state
  const hasItemsInCart = useAtomValue(hasItemsInCartAtom);
  const cartItemCount = useAtomValue(cartItemCountAtom);

  // Reset state
  const resetPOSState = useSetAtom(resetPOSStateAtom);

  // Cart management
  const addToCart = useCallback((item: OrderItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem =>
        cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && cartItem.type === item.type
            ? { 
                ...cartItem, 
                quantity: (cartItem.quantity || 1) + (item.quantity || 1), 
                total: ((cartItem.quantity || 1) + (item.quantity || 1)) * (cartItem.unitPrice || 0)
              }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      }
    });
  }, [setCartItems]);

  const updateCartItem = useCallback((itemId: string, type: string, updates: Partial<OrderItem>) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId && item.type === type
          ? { ...item, ...updates }
          : item
      )
    );
  }, [setCartItems]);

  const removeFromCart = useCallback((itemId: string, type: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === itemId && item.type === type)));
  }, [setCartItems]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartTotal(0);
  }, [setCartItems, setCartTotal]);

  const calculateCartTotal = useCallback(() => {
    const total = cartItems.reduce((sum, item) => {
      const price = item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
    setCartTotal(total);
    return total;
  }, [cartItems, setCartTotal]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.unitPrice || 0;
      const quantity = item.quantity || 1;
      return sum + (price * quantity);
    }, 0);
  }, [cartItems]);

  // Selection management
  const selectTable = useCallback((table: Table | null) => {
    setSelectedTable(table);
  }, [setSelectedTable]);

  const selectCustomer = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer);
  }, [setSelectedCustomer]);

  const selectOrderType = useCallback((orderType: OrderType | null) => {
    setSelectedOrderType(orderType);
  }, [setSelectedOrderType]);

  // Navigation management
  const navigateToView = useCallback((view: 'items' | 'tables' | 'customers' | 'orders' | 'payment') => {
    setCurrentView(view);
  }, [setCurrentView]);

  const navigateToCategory = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, [setCategoryPath]);

  const navigateBack = useCallback(() => {
    if (categoryPath.length > 0) {
      setCategoryPath(prev => prev.slice(0, -1));
    } else {
      setCurrentView('items');
    }
  }, [categoryPath, setCategoryPath, setCurrentView]);

  const navigateToItems = useCallback(() => {
    setCurrentView('items');
    setCategoryPath([]);
  }, [setCurrentView, setCategoryPath]);

  const navigateToTables = useCallback(() => {
    setCurrentView('tables');
  }, [setCurrentView]);

  const navigateToCustomers = useCallback(() => {
    setCurrentView('customers');
  }, [setCurrentView]);

  const navigateToOrders = useCallback(() => {
    setCurrentView('orders');
  }, [setCurrentView]);

  const navigateToPayment = useCallback(() => {
    setCurrentView('payment');
  }, [setCurrentView]);

  // Utility functions
  const clearPOSData = useCallback(() => {
    resetPOSState();
  }, [resetPOSState]);

  const canCreateOrder = useCallback(() => {
    return hasItemsInCart && selectedOrderType !== null;
  }, [hasItemsInCart, selectedOrderType]);

  const getCartSummary = useCallback(() => {
    const itemCount = cartItemCount;
    const total = getCartTotal();
    return {
      itemCount,
      total,
      hasItems: hasItemsInCart
    };
  }, [cartItemCount, getCartTotal, hasItemsInCart]);

  return {
    // State
    cartItems,
    cartTotal,
    cartLoading,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    currentView,
    categoryPath,
    hasItemsInCart,
    cartItemCount,

    // Cart actions
    setCartItems,
    setCartTotal,
    setCartLoading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateCartTotal,
    getCartTotal,

    // Selection actions
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    selectTable,
    selectCustomer,
    selectOrderType,

    // Navigation actions
    setCurrentView,
    setCategoryPath,
    navigateToView,
    navigateToCategory,
    navigateBack,
    navigateToItems,
    navigateToTables,
    navigateToCustomers,
    navigateToOrders,
    navigateToPayment,

    // Utility actions
    clearPOSData,
    canCreateOrder,
    getCartSummary,
  };
}

// Read-only hooks for optimization
export function usePOSCartItems() {
  return useAtomValue(cartItemsAtom);
}

export function usePOSCartTotal() {
  return useAtomValue(cartTotalAtom);
}

export function usePOSSelectedTable() {
  return useAtomValue(selectedTableAtom);
}

export function usePOSSelectedCustomer() {
  return useAtomValue(selectedCustomerAtom);
}

export function usePOSSelectedOrderType() {
  return useAtomValue(selectedOrderTypeAtom);
}

export function usePOSCurrentView() {
  return useAtomValue(currentViewAtom);
}

export function usePOSCategoryPath() {
  return useAtomValue(categoryPathAtom);
}

export function usePOSHasItemsInCart() {
  return useAtomValue(hasItemsInCartAtom);
}

export function usePOSCartItemCount() {
  return useAtomValue(cartItemCountAtom);
}