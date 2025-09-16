'use client';

import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { cartTotalAtom } from '@/store/atoms';
import { Order, OrderStatus, ItemType, OrderPayment, Table, Customer, OrderType, Product, Service, TableStatus, CartItem } from '@/types';
import { useAuthState } from '@/legacy_hooks/useAuthState';
import { useOrderState } from '@/legacy_hooks/useOrderState';
import { useOrders } from '@/legacy_hooks/orders/useOrders';
import { toast } from 'sonner';
import { db } from '@/lib/firebase/config';
import { collection, doc, serverTimestamp, FieldValue } from 'firebase/firestore';
import { useAddDocumentMutation, useUpdateDocumentMutation } from '@tanstack-query-firebase/react/firestore';

type OrderCreateData = Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export function usePOSLogic() {
  const { organizationId, user } = useAuthState();
  const { orders, refreshOrders } = useOrders(organizationId || undefined);
  const {
    cartItems,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    categoryPath,
    currentView,
    setCartItems,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setCurrentOrder,
    setCategoryPath,
    setCurrentView,
    clearPOSData,
    clearCart,
    addToCart: contextAddToCart,
    updateCartItem,
    removeFromCart,
    getCartTotal
  } = useOrderState();
  const [pendingOrderToReopen, setPendingOrderToReopen] = useState<Order | null>(null);
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ totalPaid: number; order?: Order } | null>(null);
  const [showCartItemModal, setShowCartItemModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  const cartTotal = useAtomValue(cartTotalAtom);

  // Mutations for Firebase operations
  const addOrderMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'orders')
  );
  
  const updateOrderMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'orders', 'dummy')
  );
  
  const updateTableMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'tables', 'dummy')
  );

  const handleAddToCart = useCallback((item: Product | Service, type: 'product' | 'service') => {
    if (!item) return;

    const existingItem = (cartItems || []).find(
      (cartItem: CartItem) => cartItem.id === item.id && cartItem.type === (type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE)
    );

    if (existingItem) {
      updateCartItem(item.id, type, { quantity: (existingItem.quantity || 1) + 1, total: ((existingItem.quantity || 1) + 1) * item.price });
    } else {
      contextAddToCart({
        id: item.id,
        type: type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        name: item.name,
        unitPrice: item.price,
        quantity: 1,
        total: item.price
      });
    }
  }, [cartItems, contextAddToCart, updateCartItem]);

  const handleTableSelected = useCallback((table: Table) => {
    setSelectedTable(table);
    setCurrentView('items');
  }, [setSelectedTable, setCurrentView]);

  const handleCustomerSelected = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('items');
  }, [setSelectedCustomer, setCurrentView]);

  const handleOrderTypeSelect = useCallback((orderType: OrderType) => {
    setSelectedOrderType(orderType);
  }, [setSelectedOrderType]);

  const handleOrderReopen = useCallback((order: Order) => {
    setPendingOrderToReopen(order);
    setShowOrderConfirmationDialog(true);
  }, []);

  const proceedWithOrderReopen = useCallback(() => {
    if (!pendingOrderToReopen) return;

    // Clear existing cart and load order items
    clearCart();

    const newCartItems = pendingOrderToReopen.items.map((item: CartItem) => ({
      id: item.productId || item.serviceId || item.id,
      type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total
    }));

    setCartItems(newCartItems);

    // Set the original order as selected so payments can be associated
    setCurrentOrder(pendingOrderToReopen);

    // Set table and customer if available
    if (pendingOrderToReopen.tableId) {
      // This would need to be handled by fetching the actual table
    }

    if (pendingOrderToReopen.customerName) {
      // This would need to be handled by fetching the actual customer
    }

    setShowOrderConfirmationDialog(false);
    setPendingOrderToReopen(null);
    setCurrentView('items');
  }, [pendingOrderToReopen, clearCart, setCartItems, setCurrentOrder]);

  const handleSaveOrder = useCallback(async () => {
    if (!organizationId || (cartItems || []).length === 0) return;

    try {
      // Calculate tax (assuming 15% VAT rate)
      const taxRate = 15; // Could be made configurable
      const subtotal = cartTotal;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      if (selectedOrder) {
        // Update existing order
        const orderRef = doc(db, 'organizations', organizationId, 'orders', selectedOrder.id);
        const updateData: {
          items: CartItem[];
          subtotal: number;
          taxRate: number;
          taxAmount: number;
          total: number;
          orderType: string;
          updatedAt: FieldValue;
          customerName?: string;
          customerPhone?: string;
          customerEmail?: string;
          tableId?: string;
          tableName?: string;
        } = {
          items: (cartItems || []).map((item: CartItem) => {
            const itemObj: CartItem = {
              id: `${item.type}-${item.id}`,
              type: item.type,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            };
            if (item.type === ItemType.PRODUCT && item.id !== undefined) {
              itemObj.productId = item.id;
            } else if (item.id !== undefined) {
              itemObj.serviceId = item.id;
            }
            return itemObj;
          }),
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: total,
          orderType: selectedOrderType?.name || selectedOrder.orderType || 'dine-in',
          updatedAt: serverTimestamp(),
        };

        // Add customer and table info if changed
        if (selectedCustomer?.name !== undefined) updateData.customerName = selectedCustomer.name;
        if (selectedCustomer?.phone !== undefined) updateData.customerPhone = selectedCustomer.phone;
        if (selectedCustomer?.email !== undefined) updateData.customerEmail = selectedCustomer.email;
        if (selectedTable?.id !== undefined) updateData.tableId = selectedTable.id;
        if (selectedTable?.name !== undefined) updateData.tableName = selectedTable.name;

        await updateOrderMutation.mutateAsync(updateData);

        // Update table status if table is selected and different from original
        if (selectedTable?.id && selectedTable.id !== selectedOrder.tableId) {
          // Release old table if it exists
          if (selectedOrder.tableId) {
            const oldTableRef = doc(db, 'organizations', organizationId, 'tables', selectedOrder.tableId);
            await updateTableMutation.mutateAsync({
              status: TableStatus.AVAILABLE,
              updatedAt: serverTimestamp()
            });
          }
          // Occupy new table
          const newTableRef = doc(db, 'organizations', organizationId, 'tables', selectedTable.id);
          await updateTableMutation.mutateAsync({
            status: TableStatus.OCCUPIED,
            updatedAt: serverTimestamp()
          });
        }

        toast.success('Order updated successfully');
        refreshOrders();
      } else {
        // Create new order
        // Generate a simple order number (in production, this should be more sophisticated)
        const orderNumber = `ORD-${Date.now()}`;

        // Generate queue number for the order
        let highestQueueNumber = 0;
        orders.forEach(order => {
          if (order.queueNumber) {
            const num = parseInt(order.queueNumber, 10);
            if (!isNaN(num) && num > highestQueueNumber) {
              highestQueueNumber = num;
            }
          }
        });
        
        // Increment by 1, or reset to 1 if we've reached 1000
        const queueNumber = highestQueueNumber >= 1000 ? 1 : highestQueueNumber + 1;

        const orderData: OrderCreateData = {
          organizationId,
          orderNumber,
          queueNumber: queueNumber.toString(),
          items: (cartItems || []).map((item: CartItem) => {
            const itemObj: CartItem = {
              id: `${item.type}-${item.id}`,
              type: item.type,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
            };
            if (item.type === ItemType.PRODUCT && item.id !== undefined) {
              itemObj.productId = item.id;
            } else if (item.id !== undefined) {
              itemObj.serviceId = item.id;
            }
            return itemObj;
          }),
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: total,
          status: OrderStatus.OPEN,
          paid: false,
          orderType: selectedOrderType?.name || 'dine-in',
          createdById: user?.uid || 'unknown',
          createdByName: user?.displayName || user?.email || 'Unknown User',
          includeQR: true, // Always include ZATCA QR code on receipts
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (selectedCustomer?.name !== undefined) orderData.customerName = selectedCustomer.name;
        if (selectedCustomer?.phone !== undefined) orderData.customerPhone = selectedCustomer.phone;
        if (selectedCustomer?.email !== undefined) orderData.customerEmail = selectedCustomer.email;
        if (selectedTable?.id !== undefined) orderData.tableId = selectedTable.id;
        if (selectedTable?.name !== undefined) orderData.tableName = selectedTable.name;

        await addOrderMutation.mutateAsync(orderData);

        // Update table status if table is selected
        if (selectedTable?.id) {
          const tableRef = doc(db, 'organizations', organizationId, 'tables', selectedTable.id);
          await updateTableMutation.mutateAsync({
            status: TableStatus.OCCUPIED,
            updatedAt: serverTimestamp()
          });
        }

        toast.success('Order saved successfully');
      }

      clearCart();
      clearPOSData();

    } catch (error) {
      console.error('Error saving order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save order: ${errorMessage}`);
    }
  }, [organizationId, cartItems, cartTotal, selectedOrder, selectedOrderType, selectedCustomer, selectedTable, user, clearCart, clearPOSData, refreshOrders, addOrderMutation, updateOrderMutation, updateTableMutation]);

  const handlePaymentProcessed = useCallback(async (payments: OrderPayment[]) => {
    setPaymentSuccessData({ totalPaid: payments.reduce((sum, payment) => sum + payment.amount, 0) });
    setShowPaymentSuccessDialog(true);
    setCurrentView('items');
  }, [setCurrentView]);

  const handleClearCart = useCallback(() => {
    clearCart();
    toast.success('Cart cleared');
  }, [clearCart]);

  const handleBackToItems = useCallback(() => {
    clearPOSData();
  }, [clearPOSData]);

  const handleTableDeselect = useCallback(() => {
    setSelectedTable(null);
  }, [setSelectedTable]);

  const handleCustomerDeselect = useCallback(() => {
    setSelectedCustomer(null);
  }, [setSelectedCustomer]);

  const handleOrderTypeDeselect = useCallback(() => {
    setSelectedOrderType(null);
  }, [setSelectedOrderType]);

  const handleTableSelect = useCallback(() => {
    setCurrentView('tables');
  }, [setCurrentView]);

  const handleCustomerSelect = useCallback(() => {
    setCurrentView('customers');
  }, [setCurrentView]);

  const handleOrdersClick = useCallback(() => {
    setCurrentView('orders');
  }, [setCurrentView]);

  const handleCategoryClick = useCallback((categoryId: string) => {
    setCategoryPath([...categoryPath, categoryId]);
  }, [setCategoryPath, categoryPath]);

  const handleNavigateToRoot = useCallback(() => {
    setCategoryPath([]);
  }, [setCategoryPath]);

  const handleNavigateToPath = useCallback((path: string[]) => {
    setCategoryPath(path);
  }, [setCategoryPath]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePaymentClick = useCallback((_order: Order) => {
    // This would set the selected order and navigate to payment
    // Implementation depends on how order context handles this
  }, []);

  const createTempOrderForPayment = useCallback(() => {
    if ((cartItems || []).length === 0) return null;

    // Calculate tax (assuming 15% VAT rate for preview)
    const taxRate = 15; // Could be made configurable
    const subtotal = cartTotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Generate queue number for preview
    let highestQueueNumber = 0;
    orders.forEach(order => {
      if (order.queueNumber) {
        const num = parseInt(order.queueNumber, 10);
        if (!isNaN(num) && num > highestQueueNumber) {
          highestQueueNumber = num;
        }
      }
    });
    
    // Increment by 1, or reset to 1 if we've reached 1000
    const queueNumber = highestQueueNumber >= 1000 ? 1 : highestQueueNumber + 1;

    const orderData: Order = {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      queueNumber: queueNumber.toString(),
      items: (cartItems || []).map((item: CartItem) => {
        const itemObj: CartItem = {
          id: `${item.type}-${item.id}`,
          type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        };
        if (item.type === 'product' && item.id !== undefined) {
          itemObj.productId = item.id;
        } else if (item.id !== undefined) {
          itemObj.serviceId = item.id;
        }
        return itemObj;
      }),
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      total: total,
      status: OrderStatus.OPEN,
      paid: false,
      orderType: selectedOrderType?.name || 'dine-in',
      createdById: user?.uid || 'unknown',
      createdByName: user?.displayName || user?.email || 'Unknown User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (selectedCustomer?.name !== undefined) orderData.customerName = selectedCustomer.name;
    if (selectedCustomer?.phone !== undefined) orderData.customerPhone = selectedCustomer.phone;
    if (selectedCustomer?.email !== undefined) orderData.customerEmail = selectedCustomer.email;
    if (selectedTable?.id !== undefined) orderData.tableId = selectedTable.id;
    if (selectedTable?.name !== undefined) orderData.tableName = selectedTable.name;

    return orderData;
  }, [cartItems, cartTotal, selectedOrderType, selectedCustomer, selectedTable, organizationId, user]);

  const handlePayOrder = useCallback(() => {
    if ((cartItems || []).length === 0) return;

    // If we already have a selected order (from reopening), use it
    // Otherwise, create a temporary order for new cart items
    const orderToPay = selectedOrder || createTempOrderForPayment();
    if (orderToPay) {
      setCurrentOrder(orderToPay);
      setCurrentView('payment');
    }
  }, [cartItems, selectedOrder, createTempOrderForPayment, setCurrentOrder, setCurrentView]);

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      // State
      cartItems: [],
      cartTotal: 0,
      selectedTable: null,
      selectedCustomer: null,
      selectedOrderType: null,
      selectedOrder: null,
      categoryPath: [],
      posView: 'items',
      pendingOrderToReopen: null,
      showOrderConfirmationDialog: false,
      isCartOpen: false,
      showPaymentSuccessDialog: false,
      paymentSuccessData: null,
      setShowPaymentSuccessDialog: () => {},
      setPaymentSuccessData: () => {},
      showCartItemModal: false,
      editingCartItem: null,
      setShowCartItemModal: () => {},
      setEditingCartItem: () => {},

      // Handlers
      handleAddToCart: () => {},
      handleTableSelected: () => {},
      handleCustomerSelected: () => {},
      handleOrderTypeSelect: () => {},
      handleOrderReopen: () => {},
      proceedWithOrderReopen: () => {},
      handleSaveOrder: () => {},
      handlePaymentProcessed: () => {},
      handleClearCart: () => {},
      handleBackToItems: () => {},
      handleTableDeselect: () => {},
      handleCustomerDeselect: () => {},
      handleOrderTypeDeselect: () => {},
      handleTableSelect: () => {},
      handleCustomerSelect: () => {},
      handleOrdersClick: () => {},
      handleCategoryClick: () => {},
      handleNavigateToRoot: () => {},
      handleNavigateToPath: () => {},
      handlePayOrder: () => {},
      handlePaymentClick: () => {},
      createTempOrderForPayment: () => null,
      updateCartItem: () => {},
      removeFromCart: () => {},
      setShowOrderConfirmationDialog: () => {},
      setPendingOrderToReopen: () => {},
      setPosView: () => {},
    };
  }

  return {
    // State
    cartItems,
    cartTotal,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    categoryPath,
    posView: currentView,
    pendingOrderToReopen,
    showOrderConfirmationDialog,
    isCartOpen,
    setIsCartOpen,
    showPaymentSuccessDialog,
    paymentSuccessData,
    setShowPaymentSuccessDialog,
    setPaymentSuccessData,
    showCartItemModal,
    editingCartItem,
    setShowCartItemModal,
    setEditingCartItem,

    // Handlers
    handleAddToCart,
    handleTableSelected,
    handleCustomerSelected,
    handleOrderTypeSelect,
    handleOrderReopen,
    proceedWithOrderReopen,
    handleSaveOrder,
    handlePaymentProcessed,
    handleClearCart,
    handleBackToItems,
    handleTableDeselect,
    handleCustomerDeselect,
    handleOrderTypeDeselect,
    handleTableSelect,
    handleCustomerSelect,
    handleOrdersClick,
    handleCategoryClick,
    handleNavigateToRoot,
    handleNavigateToPath,
    handlePayOrder,
    handlePaymentClick,
    createTempOrderForPayment,
    updateCartItem,
    removeFromCart,
    setShowOrderConfirmationDialog,
    setPendingOrderToReopen,
    setPosView: setCurrentView,
  };
}