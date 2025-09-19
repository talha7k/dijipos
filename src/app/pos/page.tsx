"use client";

import React, { useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { selectedOrganizationAtom } from '@/atoms';
import { CartItem, ItemType, Order, OrderStatus, PaymentStatus, Product, Service, Table, Customer, OrderType, OrderPayment } from "@/types";
import { useProducts } from "@/lib/hooks/useProducts";
import { useServices } from "@/lib/hooks/useServices";
import { useTables } from "@/lib/hooks/useTables";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { useOrders } from "@/lib/hooks/useOrders";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUser } from "@/lib/firebase/firestore/users";
import { calculateCartTotals } from "@/lib/vat-calculator";

import {
  POSLayout,
  POSLeftColumn,
  POSHeaderContainer,
  POSMainContent,
  POSRightColumn,
} from "./components/POSLayout";
import { POSHeader } from "@/components/orders/POSHeader";
import { POSViewsManager } from "./components/POSViewsManager";
import { POSCartSidebar } from "@/components/orders/POSCartSidebar";
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  safeCartItemsAtom,
  cartTotalAtom,
  cartSubtotalAtom,
  vatSettingsAtom,
  selectedTableAtom,
  selectedCustomerAtom,
  selectedOrderTypeAtom,
  selectedCartOrderAtom,
  currentViewAtom,
  categoryPathAtom,
  resetPOSStateAtom,
  nextQueueNumberAtom,
  currentQueueNumberAtom
} from '@/atoms/posAtoms';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PaymentSuccessDialog } from "@/components/PaymentSuccessDialog";
import { CartItemModal } from "@/components/orders/CartItemModal";

export default function SimplifiedPOSPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;

  // Data hooks
  const { products, categories, loading: productsLoading } = useProducts();
  const { services, loading: servicesLoading } = useServices();
  const { tables, loading: tablesLoading } = useTables();
  const { customers, loading: customersLoading } = useCustomers();
  const { orders, loading: ordersLoading, createNewOrder, updateExistingOrder } = useOrders();
   const { storeSettings, loading: storeSettingsLoading } = useStoreSettings();
  const orderTypes = useMemo(() => storeSettings?.orderTypes || [], [storeSettings?.orderTypes]);
  const paymentTypes = storeSettings?.paymentTypes || [];

  // Use POS atoms directly
  const [cartItems, setCartItems] = useAtom(safeCartItemsAtom);
  const cartTotal = useAtomValue(cartTotalAtom);
  const cartSubtotal = useAtomValue(cartSubtotalAtom);
  const [vatSettings, setVatSettings] = useAtom(vatSettingsAtom);
  const [selectedTable, setSelectedTable] = useAtom(selectedTableAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom(selectedCustomerAtom);
  const [selectedOrderType, setSelectedOrderType] = useAtom(selectedOrderTypeAtom);
  const [selectedOrder, setSelectedOrder] = useAtom(selectedCartOrderAtom);
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [categoryPath, setCategoryPath] = useAtom(categoryPathAtom);
  const resetPOSState = useSetAtom(resetPOSStateAtom);
  const [nextQueueNumber, setNextQueueNumber] = useAtom(nextQueueNumberAtom);
  const setCurrentQueueNumber = useSetAtom(currentQueueNumberAtom);


  // Local state for UI
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);
  const [pendingOrderToReopen, setPendingOrderToReopen] = useState<Order | null>(null);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ totalPaid: number; order?: Order } | null>(null);
  const [showCartItemModal, setShowCartItemModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  // Get auth context
  const { user } = useAuth();

  // User name state
  const [userName, setUserName] = useState<string>('');

  // Fetch user profile on mount
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const userProfile = await getUser(user.uid);
          if (userProfile?.name) {
            setUserName(userProfile.name);
          } else {
            // Fallback to Firebase Auth displayName or email
            setUserName(user.displayName || user.email || 'Unknown User');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserName(user.displayName || user.email || 'Unknown User');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Ensure POS starts with items view when pathname changes to /pos
  React.useEffect(() => {
    if (pathname === '/pos') {
      setCurrentView('items');
      setCategoryPath([]);
    }
  }, [pathname, setCurrentView, setCategoryPath]);

  // Update VAT settings atom when store settings change
  React.useEffect(() => {
    if (storeSettings?.vatSettings) {
      setVatSettings(storeSettings.vatSettings);
    }
  }, [storeSettings, setVatSettings]);





  // Handler functions
  const handleAddToCart = useCallback((item: Product | Service, type: 'product' | 'service') => {
    if (!item) return;

    const currentCartItems = cartItems || [];
    const existingItem = currentCartItems.find(
      (cartItem: CartItem) => cartItem.id === item.id && cartItem.type === (type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE)
    );

    if (existingItem) {
      const updatedCart = currentCartItems.map(cartItem =>
        cartItem.id === item.id && cartItem.type === (type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE)
          ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1, total: ((cartItem.quantity || 1) + 1) * item.price }
          : cartItem
      );
      setCartItems(updatedCart);
    } else {
      const newItem: CartItem = {
        id: item.id,
        type: type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        name: item.name,
        unitPrice: item.price,
        quantity: 1,
        total: item.price
      };
      setCartItems([...currentCartItems, newItem]);
    }
    
    // Set current queue number when adding items to cart
    console.log('Setting current queue number to:', nextQueueNumber, '(nextQueueNumber value)');
    setCurrentQueueNumber(nextQueueNumber);
  }, [cartItems, setCartItems, nextQueueNumber, setCurrentQueueNumber]);

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

    // Load order items directly into cart
    const newCartItems = pendingOrderToReopen.items.map((item: CartItem) => ({
      id: item.productId || item.serviceId || item.id,
      type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total
    }));

    setCartItems(newCartItems);
    setSelectedOrder(pendingOrderToReopen);

    // Restore customer from order data
    if (pendingOrderToReopen.customerName && customers.length > 0) {
      const matchingCustomer = customers.find(customer => 
        customer.name === pendingOrderToReopen.customerName && 
        customer.phone === pendingOrderToReopen.customerPhone
      );
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
      }
    }

    // Restore table from order data
    if (pendingOrderToReopen.tableId && tables.length > 0) {
      const matchingTable = tables.find(table => table.id === pendingOrderToReopen.tableId);
      if (matchingTable) {
        setSelectedTable(matchingTable);
      }
    }

    // Restore order type from order data
    if (pendingOrderToReopen.orderType && orderTypes.length > 0) {
      const matchingOrderType = orderTypes.find(orderType => 
        orderType.name.toLowerCase() === pendingOrderToReopen.orderType.toLowerCase()
      );
      if (matchingOrderType) {
        setSelectedOrderType(matchingOrderType);
      }
    }

    setShowOrderConfirmationDialog(false);
    setPendingOrderToReopen(null);
    setCurrentView('items');
  }, [pendingOrderToReopen, setCartItems, setSelectedOrder, setSelectedCustomer, setSelectedTable, setSelectedOrderType, setCurrentView, customers, tables, orderTypes]);

  const handleSaveOrder = useCallback(async () => {
    if (!organizationId || (cartItems || []).length === 0) return;

    try {
      // Use VAT settings from store or defaults
      const taxRate = vatSettings?.rate || 15;
      const isVatEnabled = vatSettings?.isEnabled || false;
      const isVatInclusive = vatSettings?.isVatInclusive || false;
      
      let subtotal, taxAmount, total;
      
      if (isVatEnabled) {
        // VAT is enabled, use proper calculation
        const itemsForCalculation = (cartItems || []).map(item => ({
          price: item.total / item.quantity, // Get unit price
          quantity: item.quantity
        }));
        
        const result = calculateCartTotals(
          itemsForCalculation,
          taxRate,
          isVatInclusive
        );
        
        subtotal = result.subtotal;
        taxAmount = result.vatAmount;
        total = result.total;
      } else {
        // VAT is disabled, simple calculation
        subtotal = cartSubtotal;
        taxAmount = 0;
        total = subtotal;
      }

      const orderData = {
        organizationId,
        orderNumber: selectedOrder?.orderNumber || `ORD-${Date.now()}`,
        queueNumber: selectedOrder?.queueNumber || (nextQueueNumber?.toString() || '1'),
        items: cartItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: OrderStatus.OPEN,
        paymentStatus: PaymentStatus.UNPAID,
        paid: false,
        orderType: selectedOrderType?.name || 'dine-in',
        ...(selectedCustomer?.name && { customerName: selectedCustomer.name }),
        ...(selectedCustomer?.phone && { customerPhone: selectedCustomer.phone }),
        ...(selectedCustomer?.email && { customerEmail: selectedCustomer.email }),
        ...(selectedTable?.id && { tableId: selectedTable.id }),
        ...(selectedTable?.name && { tableName: selectedTable.name }),
        createdById: user?.uid || 'unknown',
        createdByName: userName || user?.displayName || user?.email || 'Unknown User',
        createdAt: selectedOrder?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (selectedOrder) {
        // Update existing order
        await updateExistingOrder(selectedOrder.id, orderData);
        console.log('Order updated successfully');
        
        // Reset POS state after updating order (clears cart, table, customer, selectedOrder, but preserves order type)
        resetPOSState();
      } else {
        // Create new order
        const orderId = await createNewOrder(orderData);
        console.log('Order created successfully:', orderId);

        // Reset POS state for new order (clears cart, table, customer, selectedOrder, but preserves order type)
        resetPOSState();

        // Increment queue number for new orders
        const newQueueNumber = nextQueueNumber + 1;
        console.log('Incrementing queue number from', nextQueueNumber, 'to', newQueueNumber);
        setNextQueueNumber(newQueueNumber);
      }
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }, [organizationId, cartItems, cartSubtotal, selectedOrder, selectedOrderType, selectedCustomer, selectedTable, user, userName, nextQueueNumber, createNewOrder, updateExistingOrder, resetPOSState, setNextQueueNumber, vatSettings?.isEnabled, vatSettings?.isVatInclusive, vatSettings?.rate]);

  const handlePaymentProcessed = useCallback(async (payments: OrderPayment[]) => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Update the order's payment status if we have a selected order
    if (selectedOrder) {
      try {
        await updateExistingOrder(selectedOrder.id, {
          paymentStatus: PaymentStatus.PAID,
          paid: true
        });
      } catch (error) {
        console.error('Error updating order payment status:', error);
      }
    }

    setPaymentSuccessData({ totalPaid });
    setShowPaymentSuccessDialog(true);
    setCurrentView('items');
  }, [setCurrentView, selectedOrder, updateExistingOrder]);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCurrentQueueNumber(null);
  }, [setCartItems, setCurrentQueueNumber]);

  const handleBackToItems = useCallback(() => {
    resetPOSState();
  }, [resetPOSState]);

  // New function that preserves cart when navigating back to POS
  const handleBackToItemsPreserveCart = useCallback(() => {
    setCurrentView('items');
    setCategoryPath([]);
    setSelectedTable(null);
    setSelectedCustomer(null);
    setSelectedOrder(null);
  }, [setCurrentView, setCategoryPath, setSelectedTable, setSelectedCustomer, setSelectedOrder]);

  // Function to handle order toggle
  const handleOrderToggle = useCallback(() => {
    if (currentView === 'items') {
      // When on items view, reset for new order
      resetPOSState();
    } else {
      // When on other views, just switch to items view without clearing cart
      setCurrentView('items');
      setCategoryPath([]);
    }
  }, [currentView, resetPOSState, setCurrentView, setCategoryPath]);

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

  const handlePayOrder = useCallback(() => {
    if (cartItems.length === 0) return;

    // Assign queue number for new orders
    const queueNumber = selectedOrder?.queueNumber || nextQueueNumber.toString();

    // If this is a new order (not reopening existing), increment the queue counter
    if (!selectedOrder) {
      const newQueueNumber = nextQueueNumber + 1;
      console.log('Payment flow: Incrementing queue number from', nextQueueNumber, 'to', newQueueNumber);
      setNextQueueNumber(newQueueNumber);
    }

    const orderToPay = selectedOrder || {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      queueNumber: queueNumber,
      items: cartItems,
      subtotal: cartSubtotal,
      taxRate: 15,
      taxAmount: cartSubtotal * 0.15,
      total: cartTotal,
      status: OrderStatus.OPEN,
      paymentStatus: PaymentStatus.UNPAID,
      paid: false,
      orderType: selectedOrderType?.name || 'dine-in',
      createdById: user?.uid || 'unknown',
      createdByName: userName || user?.displayName || user?.email || 'Unknown User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSelectedOrder(orderToPay);
    setCurrentView('payment');
  }, [cartItems, cartTotal, cartSubtotal, selectedOrder, selectedOrderType, organizationId, user, userName, setSelectedOrder, setCurrentView, nextQueueNumber, setNextQueueNumber]);

  const updateCartItem = useCallback((itemId: string, type: string, updates: Partial<CartItem>) => {
    const updatedCart = cartItems.map(item =>
      item.id === itemId && item.type === type
        ? { ...item, ...updates }
        : item
    );
    setCartItems(updatedCart);
  }, [cartItems, setCartItems]);

  const removeFromCart = useCallback((itemId: string, type: string) => {
    const updatedCart = cartItems.filter(item => !(item.id === itemId && item.type === type));
    setCartItems(updatedCart);
  }, [cartItems, setCartItems]);

  // Loading state - exclude ordersLoading when viewing orders to prevent stuck loading
  const loading =
    productsLoading ||
    servicesLoading ||
    tablesLoading ||
    customersLoading ||
    (currentView !== 'orders' ? ordersLoading : false) ||
    storeSettingsLoading;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-lg">Loading POS...</div>
      </div>
    );
  }

  // Transform CartItem[] to CartItem[] for component compatibility
  const cartForComponents = (cartItems || []).map((item) => ({
    id: item.id,
    type: item.type === "product" ? ("product" as const) : ("service" as const),
    name: item.name,
    price: item.unitPrice,
    quantity: item.quantity,
    total: item.total,
  }));

  return (
    <POSLayout>
      <POSLeftColumn>
        <POSHeaderContainer>
          <POSHeader
            cartItems={cartForComponents}
            cartTotal={cartTotal}
            selectedTable={selectedTable}
            selectedCustomer={selectedCustomer}
            selectedOrder={selectedOrder}
            orderTypes={orderTypes}
            selectedOrderType={selectedOrderType}
            onTableSelect={handleTableSelect}
            onCustomerSelect={handleCustomerSelect}
            onOrderTypeSelect={handleOrderTypeSelect}
            onTableDeselect={handleTableDeselect}
            onCustomerDeselect={handleCustomerDeselect}
            onOrderTypeDeselect={handleOrderTypeDeselect}
            onOrdersClick={handleOrdersClick}
            onOrderToggle={handleOrderToggle}
            isOnPOSPage={true}
            currentView={currentView}
           />
        </POSHeaderContainer>

        <POSMainContent>
            <POSViewsManager
              currentView={currentView as import('./components/POSViewsManager').POSViewType}
             products={products}
             services={services}
             categories={categories}
             tables={tables}
             customers={customers}
             orders={orders}
             orderPayments={{}}
             paymentTypes={paymentTypes}
             selectedOrder={selectedOrder}
             categoryPath={categoryPath}
             organizationId={organizationId || undefined}
             onCategoryClick={handleCategoryClick}
             onNavigateToRoot={handleNavigateToRoot}
             onNavigateToPath={handleNavigateToPath}
             onItemClick={handleAddToCart}
             onTableSelect={handleTableSelected}
             onCustomerSelect={handleCustomerSelected}
             onOrderSelect={handleOrderReopen}
             onPayOrder={() => {}}
              onBackToItems={handleBackToItemsPreserveCart}
             onPaymentProcessed={async (payments) => {
               await handlePaymentProcessed(payments);
             }}
           />
        </POSMainContent>
      </POSLeftColumn>

      <POSRightColumn>
         <POSCartSidebar
           cartItems={cartForComponents}
           cartTotal={cartTotal}
           cartSubtotal={cartSubtotal}
           onItemClick={(item) => {
             // Transform CartItem back to CartItem for state management
             const cartItem: CartItem = {
               id: item.id,
               type:
                 item.type === "product" ? ItemType.PRODUCT : ItemType.SERVICE,
               name: item.name,
               quantity: item.quantity,
               unitPrice: item.price,
               total: item.total,
             };
             setEditingCartItem(cartItem);
             setShowCartItemModal(true);
           }}
            onPayOrder={handlePayOrder}
            onSaveOrder={handleSaveOrder}
            onClearCart={handleClearCart}
            userName={userName}
         />
      </POSRightColumn>

      {/* Order Confirmation Dialog */}
      <AlertDialog
        open={showOrderConfirmationDialog}
        onOpenChange={setShowOrderConfirmationDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current cartItems with order #
              {pendingOrderToReopen?.orderNumber}. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setShowOrderConfirmationDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithOrderReopen}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        isOpen={showPaymentSuccessDialog}
        onClose={() => setShowPaymentSuccessDialog(false)}
        totalPaid={paymentSuccessData?.totalPaid || 0}
        onViewOrders={handleBackToItems}
      />

      {/* Cart Item Modal */}
      {editingCartItem && (
        <CartItemModal
          item={{
            id: editingCartItem.id,
            type:
              editingCartItem.type === ItemType.PRODUCT ? "product" : "service",
            name: editingCartItem.name,
            price: editingCartItem.unitPrice,
            quantity: editingCartItem.quantity,
            total: editingCartItem.total,
          }}
          isOpen={showCartItemModal}
          onClose={() => setShowCartItemModal(false)}
          onUpdateQuantity={(itemId, newQuantity) => {
            // Handle quantity update
            if (editingCartItem) {
              updateCartItem(itemId, editingCartItem.type, {
                quantity: newQuantity,
                total: newQuantity * editingCartItem.unitPrice,
              });
            }
            setShowCartItemModal(false);
          }}
          onDeleteItem={(itemId) => {
            // Handle item deletion
            if (editingCartItem) {
              removeFromCart(itemId, editingCartItem.type);
            }
            setShowCartItemModal(false);
          }}
        />
      )}
    </POSLayout>
  );
}
