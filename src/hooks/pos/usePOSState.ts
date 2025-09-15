'use client';

import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { cartTotalAtom } from '@/store/atoms';
import { Order, OrderStatus, ItemType, OrderPayment, Table, Customer, OrderType, Product, Service, TableStatus, OrderItem } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import { useOrderState } from '@/hooks/useOrderState';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

export function usePOSLogic() {
  const { organizationId, user } = useAuthState();
  const {
    cartItems,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    categoryPath,
    setCartItems,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setCurrentOrder,
    setCategoryPath,
    clearPOSData,
    clearCart,
    addToCart: contextAddToCart,
    updateCartItem,
    removeFromCart,
    getCartTotal
  } = useOrderState();

  const [posView, setPosView] = useState<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
  const [pendingOrderToReopen, setPendingOrderToReopen] = useState<Order | null>(null);
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ totalPaid: number; order?: Order } | null>(null);
  const [showCartItemModal, setShowCartItemModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<OrderItem | null>(null);

  const cartTotal = useAtomValue(cartTotalAtom);

  const handleAddToCart = useCallback((item: Product | Service, type: 'product' | 'service') => {
    if (!item) return;

    const existingItem = cartItems.find(
      (cartItem: OrderItem) => cartItem.id === item.id && cartItem.type === (type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE)
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
    setPosView('items');
  }, [setSelectedTable]);

  const handleCustomerSelected = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setPosView('items');
  }, [setSelectedCustomer]);

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

    const newCartItems = pendingOrderToReopen.items.map((item: OrderItem) => ({
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
    setPosView('items');
  }, [pendingOrderToReopen, clearCart, setCartItems, setCurrentOrder]);

  const handleSaveOrder = useCallback(async () => {
    if (!organizationId || cartItems.length === 0) return;

    try {
      // Generate a simple order number (in production, this should be more sophisticated)
      const orderNumber = `ORD-${Date.now()}`;
      
      const orderData = {
        organizationId,
        orderNumber,
        items: cartItems.map((item: OrderItem) => ({
          id: `${item.type}-${item.id}`,
          type: item.type,
          productId: item.type === ItemType.PRODUCT ? item.id : undefined,
          serviceId: item.type === ItemType.SERVICE ? item.id : undefined,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subtotal: cartTotal,
        taxRate: 0,
        taxAmount: 0,
        total: cartTotal,
        status: OrderStatus.OPEN,
        paid: false,
        orderType: selectedOrderType?.name || 'dine-in',
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        customerEmail: selectedCustomer?.email,
        tableId: selectedTable?.id,
        tableName: selectedTable?.name,
        createdById: user?.uid || 'unknown',
        createdByName: user?.displayName || user?.email || 'Unknown User',
        includeQR: true, // Always include ZATCA QR code on receipts
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'organizations', organizationId, 'orders'), orderData);
      
      // Update table status if table is selected
      if (selectedTable?.id) {
        await updateDoc(doc(db, 'organizations', organizationId, 'tables', selectedTable.id), {
          status: TableStatus.OCCUPIED,
          updatedAt: serverTimestamp()
        });
      }

      toast.success('Order saved successfully');
      clearCart();
      clearPOSData();
      
    } catch (error) {
      console.error('Error saving order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save order: ${errorMessage}`);
    }
  }, [organizationId, cartItems, cartTotal, selectedOrderType, selectedCustomer, selectedTable, user, clearCart, clearPOSData]);

  const handlePaymentProcessed = useCallback(async (payments: OrderPayment[]) => {
    setPaymentSuccessData({ totalPaid: payments.reduce((sum, payment) => sum + payment.amount, 0) });
    setShowPaymentSuccessDialog(true);
    setPosView('items');
  }, []);

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
    setPosView('tables');
  }, []);

  const handleCustomerSelect = useCallback(() => {
    setPosView('customers');
  }, []);

  const handleOrdersClick = useCallback(() => {
    setPosView('orders');
  }, []);

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
    if (cartItems.length === 0) return null;

    return {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      items: cartItems.map((item: OrderItem) => ({
        id: `${item.type}-${item.id}`,
        type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        productId: item.type === 'product' ? item.id : undefined,
        serviceId: item.type === 'service' ? item.id : undefined,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: cartTotal,
      taxRate: 0,
      taxAmount: 0,
      total: cartTotal,
      status: OrderStatus.OPEN,
      paid: false,
      orderType: selectedOrderType?.name || 'dine-in',
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerEmail: selectedCustomer?.email,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      createdById: user?.uid || 'unknown',
      createdByName: user?.displayName || user?.email || 'Unknown User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }, [cartItems, cartTotal, selectedOrderType, selectedCustomer, selectedTable, organizationId, user]);

  const handlePayOrder = useCallback(() => {
    if (cartItems.length === 0) return;

    // If we already have a selected order (from reopening), use it
    // Otherwise, create a temporary order for new cart items
    const orderToPay = selectedOrder || createTempOrderForPayment();
    if (orderToPay) {
      setCurrentOrder(orderToPay);
      setPosView('payment');
    }
  }, [cartItems, selectedOrder, createTempOrderForPayment, setCurrentOrder, setPosView]);

  return {
    // State
    cartItems,
    cartTotal,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    selectedOrder,
    categoryPath,
    posView,
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
    setPosView,
  };
}