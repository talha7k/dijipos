"use client";

import React, { useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { format } from "date-fns";
import { selectedOrganizationAtom } from "@/atoms";
import {
  CartItem,
  Item,
  ItemType,
  Order,
  OrderStatus,
  PaymentStatus,
  Table,
  Customer,
  OrderType,
  OrderPayment,
} from "@/types";
import { useItems } from "@/lib/hooks/useItems";
import { useCategories } from "@/lib/hooks/useCategories";
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
import { POSHeader } from "@/components/pos/POSHeader";
import { POSViewsManager } from "./components/POSViewsManager";
import { POSCartSidebar } from "@/components/pos/POSCartSidebar";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
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
  currentQueueNumberAtom,
  selectedDateAtom,
} from "@/atoms/posAtoms";

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
import { Button } from "@/components/ui/button";
import { PaymentSuccessDialog } from "@/components/PaymentSuccessDialog";
import { CartItemModal } from "@/components/pos/CartItemModal";
import { BusinessDaySelectionDialog } from "@/components/pos/BusinessDaySelectionDialog";
import { Loader2 } from "lucide-react";
import { useDateExpiryTimer } from "@/lib/utils/dateTimer";
import { Loader } from "@/components/ui/loader";

export default function SimplifiedPOSPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;

  // Data hooks
  const { items, loading: itemsLoading } = useItems();
  const { categories, loading: categoriesLoading } = useCategories();
  const { tables, loading: tablesLoading } = useTables();
  const { customers, loading: customersLoading } = useCustomers();
  const {
    orders,
    loading: ordersLoading,
    createNewOrder,
    updateExistingOrder,
    addPaymentToOrder,
    getPaymentsForOrder,
  } = useOrders();
  const { storeSettings, loading: storeSettingsLoading } = useStoreSettings();
  const orderTypes = useMemo(
    () => storeSettings?.orderTypes || [],
    [storeSettings?.orderTypes],
  );
  const paymentTypes = storeSettings?.paymentTypes || [];

  // Use POS atoms directly
  const [cartItems, setCartItems] = useAtom(safeCartItemsAtom);
  const cartTotal = useAtomValue(cartTotalAtom);
  const cartSubtotal = useAtomValue(cartSubtotalAtom);
  const [vatSettings, setVatSettings] = useAtom(vatSettingsAtom);
  const [selectedTable, setSelectedTable] = useAtom(selectedTableAtom);
  const [selectedCustomer, setSelectedCustomer] = useAtom(selectedCustomerAtom);
  const [selectedOrderType, setSelectedOrderType] = useAtom(
    selectedOrderTypeAtom,
  );
  const [selectedOrder, setSelectedOrder] = useAtom(selectedCartOrderAtom);
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [categoryPath, setCategoryPath] = useAtom(categoryPathAtom);
  const resetPOSState = useSetAtom(resetPOSStateAtom);
  const [nextQueueNumber, setNextQueueNumber] = useAtom(nextQueueNumberAtom);
  const setCurrentQueueNumber = useSetAtom(currentQueueNumberAtom);
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);

  // Local state for UI
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] =
    useState(false);
  const [showDateSelectionDialog, setShowDateSelectionDialog] = useState(false);
  const [pendingOrderToReopen, setPendingOrderToReopen] =
    useState<Order | null>(null);
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] =
    useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    totalPaid: number;
    order?: Order;
  } | null>(null);
  const [showCartItemModal, setShowCartItemModal] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [isSavedOrderLoaded, setIsSavedOrderLoaded] = useState(false);
  const [isSavedOrderModified, setIsSavedOrderModified] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // State for order payments
  const [orderPayments, setOrderPayments] = useState<{
    [orderId: string]: OrderPayment[];
  }>({});
  const [orderPaymentsLoading, setOrderPaymentsLoading] = useState(false);

  // Get auth context
  const { user } = useAuth();

  // User name state
  const [userName, setUserName] = useState<string>("");

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
            setUserName(user.displayName || user.email || "Unknown User");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserName(user.displayName || user.email || "Unknown User");
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  React.useEffect(() => {
    if (!selectedDate || selectedDate === "") {
      setShowDateSelectionDialog(true);
    }
  }, [selectedDate]);

  // Ensure POS starts with items view when pathname changes to /pos
  React.useEffect(() => {
    if (pathname === "/pos") {
      setCurrentView("items");
      setCategoryPath([]);
    }
  }, [pathname, setCurrentView, setCategoryPath]);

  // Update VAT settings atom when store settings change
  React.useEffect(() => {
    if (storeSettings?.vatSettings) {
      setVatSettings(storeSettings.vatSettings);
    }
  }, [storeSettings, setVatSettings]);

  // Auto-clear selected date after 20 hours
  useDateExpiryTimer(
    selectedDate,
    () => setSelectedDate(""),
    20
  );

  const handleDateChange = (date: Date) => {
    setSelectedDate(date.toISOString());
    setShowDateSelectionDialog(false);
  };

  // Handler functions
  const handleAddToCart = useCallback(
    (item: Item) => {
      if (!item) return;

      const currentCartItems = cartItems || [];
      const existingItem = currentCartItems.find(
        (cartItem: CartItem) =>
          cartItem.itemId === item.id,
      );

      if (existingItem) {
        const updatedCart = currentCartItems.map((cartItem) =>
          cartItem.itemId === item.id
            ? {
                ...cartItem,
                quantity: (cartItem.quantity || 1) + 1,
                total: ((cartItem.quantity || 1) + 1) * item.price,
              }
            : cartItem,
        );
        setCartItems(updatedCart);
      } else {
        const newItem: CartItem = {
          id: item.id,
          type: item.itemType === "product" ? ItemType.PRODUCT : ItemType.SERVICE,
          itemId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: 1,
          total: item.price,
        };
        setCartItems([...currentCartItems, newItem]);
      }

      if (isSavedOrderLoaded) {
        setIsSavedOrderModified(true);
      }

      // Set current queue number when adding items to cart
      console.log(
        "Setting current queue number to:",
        nextQueueNumber,
        "(nextQueueNumber value)",
      );
      setCurrentQueueNumber(nextQueueNumber);
    },
    [
      cartItems,
      setCartItems,
      nextQueueNumber,
      setCurrentQueueNumber,
      isSavedOrderLoaded,
      setIsSavedOrderModified,
    ],
  );

  const handleTableSelected = useCallback(
    (table: Table) => {
      setSelectedTable(table);
      setCurrentView("items");
    },
    [setSelectedTable, setCurrentView],
  );

  const handleCustomerSelected = useCallback(
    (customer: Customer) => {
      setSelectedCustomer(customer);
      setCurrentView("items");
    },
    [setSelectedCustomer, setCurrentView],
  );

  const handleOrderTypeSelect = useCallback(
    (orderType: OrderType) => {
      setSelectedOrderType(orderType);
    },
    [setSelectedOrderType],
  );

  const handleViewOrderDetail = useCallback((order: Order) => {
    // TODO: Implement order detail view logic
    console.log("Viewing order:", order.id);
  }, []);

  const handleOrderReopen = useCallback((order: Order) => {
    setPendingOrderToReopen(order);
    setShowOrderConfirmationDialog(true);
  }, []);

  const resetAllState = useCallback(() => {
    resetPOSState();
    setIsSavedOrderLoaded(false);
    setIsSavedOrderModified(false);
  }, [resetPOSState, setIsSavedOrderLoaded, setIsSavedOrderModified]);

  const proceedWithOrderReopen = useCallback(() => {
    if (!pendingOrderToReopen) return;

    // Load order items directly into cart
    const newCartItems = pendingOrderToReopen.items.map((item: CartItem) => ({
      id: item.id,
      type: item.type === "product" ? ItemType.PRODUCT : ItemType.SERVICE,
      itemId: item.itemId,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      total: item.total,
    }));

    setCartItems(newCartItems);
    setSelectedOrder(pendingOrderToReopen);

    // Restore customer from order data
    if (pendingOrderToReopen.customerName && customers.length > 0) {
      const matchingCustomer = customers.find(
        (customer) =>
          customer.name === pendingOrderToReopen.customerName &&
          customer.phone === pendingOrderToReopen.customerPhone,
      );
      if (matchingCustomer) {
        setSelectedCustomer(matchingCustomer);
      }
    }

    // Restore table from order data
    if (pendingOrderToReopen.tableId && tables.length > 0) {
      const matchingTable = tables.find(
        (table) => table.id === pendingOrderToReopen.tableId,
      );
      if (matchingTable) {
        setSelectedTable(matchingTable);
      }
    }

    // Restore order type from order data
    if (pendingOrderToReopen.orderType && orderTypes.length > 0) {
      const matchingOrderType = orderTypes.find(
        (orderType) =>
          orderType.name.toLowerCase() ===
          pendingOrderToReopen.orderType.toLowerCase(),
      );
      if (matchingOrderType) {
        setSelectedOrderType(matchingOrderType);
      }
    }

    setIsSavedOrderLoaded(true);
    setIsSavedOrderModified(false);

    setShowOrderConfirmationDialog(false);
    setPendingOrderToReopen(null);
    setCurrentView("items");
  }, [
    pendingOrderToReopen,
    setCartItems,
    setSelectedOrder,
    setSelectedCustomer,
    setSelectedTable,
    setSelectedOrderType,
    setCurrentView,
    customers,
    tables,
    orderTypes,
    setIsSavedOrderLoaded,
    setIsSavedOrderModified,
  ]);

  const handleSaveOrder = useCallback(async () => {
    console.log("--------------- handleSaveOrder --------------- ", {
      isSavedOrderLoaded,
      isSavedOrderModified,
      selectedOrderId: selectedOrder?.id,
      selectedOrderPaymentStatus: selectedOrder?.paymentStatus,
    });

    if (!organizationId || (cartItems || []).length === 0) return;
    setIsProcessing(true);
    try {
      // Use VAT settings from store or defaults
      const taxRate = vatSettings?.rate || 15;
      const isVatEnabled = vatSettings?.isEnabled || false;
      const isVatInclusive = vatSettings?.isVatInclusive || false;

      let subtotal, taxAmount, total;

      if (isVatEnabled) {
        // VAT is enabled, use proper calculation
        const itemsForCalculation = (cartItems || []).map((item) => ({
          price: item.total / item.quantity, // Get unit price
          quantity: item.quantity,
        }));

        const result = calculateCartTotals(
          itemsForCalculation,
          taxRate,
          isVatInclusive,
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
        queueNumber:
          selectedOrder?.queueNumber || nextQueueNumber?.toString() || "1",
        items: cartItems,
        subtotal,
        taxRate,
        taxAmount,
        total,
        status: OrderStatus.OPEN,
        orderType: selectedOrderType?.name || "dine-in",
        customerName: selectedCustomer?.name || undefined,
        customerPhone: selectedCustomer?.phone || undefined,
        customerEmail: selectedCustomer?.email || undefined,
        tableId: selectedTable?.id || undefined,
        tableName: selectedTable?.name || undefined,
        createdById: user?.uid || "unknown",
        createdByName:
          userName || user?.displayName || user?.email || "Unknown User",
        createdAt: selectedOrder?.createdAt || new Date(),
        updatedAt: new Date(),
        selectedDate: selectedDate,
      };

      if (isSavedOrderLoaded && selectedOrder) {
        // Update existing order
        let newPaymentStatus = selectedOrder.paymentStatus;
        if (
          isSavedOrderModified &&
          selectedOrder.paymentStatus === PaymentStatus.PAID
        ) {
          newPaymentStatus = PaymentStatus.PARTIAL;
        }
        const orderDataToUpdate = {
          ...orderData,
          paymentStatus: newPaymentStatus,
        };
        await updateExistingOrder(selectedOrder.id, orderDataToUpdate);
        console.log("Order updated successfully");

        // Reset POS state after updating order
        resetAllState();
      } else {
        // Create new order
        const orderDataToCreate = {
          ...orderData,
          paymentStatus: PaymentStatus.UNPAID,
        };
        const orderId = await createNewOrder(orderDataToCreate);
        console.log("Order created successfully:", orderId);

        // Reset POS state for new order
        resetAllState();

        // Increment queue number for new orders
        const newQueueNumber = nextQueueNumber + 1;
        console.log(
          "Incrementing queue number from",
          nextQueueNumber,
          "to",
          newQueueNumber,
        );
        setNextQueueNumber(newQueueNumber);
      }
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    organizationId,
    cartItems,
    cartSubtotal,
    selectedOrder,
    selectedOrderType,
    selectedCustomer,
    selectedTable,
    user,
    userName,
    nextQueueNumber,
    createNewOrder,
    updateExistingOrder,
    resetAllState,
    setNextQueueNumber,
    vatSettings?.isEnabled,
    vatSettings?.isVatInclusive,
    vatSettings?.rate,
    calculateCartTotals,
    setIsProcessing,
    isSavedOrderLoaded,
    isSavedOrderModified,
  ]);

  const handlePaymentProcessed = useCallback(
    async (payments: OrderPayment[]) => {
      const totalPaid = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      setIsProcessing(true);
      try {
        // If we have a selected order, save payments to it
        if (selectedOrder) {
          // Save each payment record
          for (const payment of payments) {
            try {
              const paymentData: Omit<
                OrderPayment,
                "id" | "orderId" | "createdAt"
              > = {
                organizationId: selectedOrder.organizationId,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                paymentDate: payment.paymentDate,
              };
              if (payment.reference) {
                paymentData.reference = payment.reference;
              }
              if (payment.notes) {
                paymentData.notes = payment.notes;
              }
              await addPaymentToOrder(selectedOrder.id, paymentData);
            } catch (error) {
              console.error("Error saving payment:", error);
              throw error;
            }
          }

          // Update order payment status based on total paid vs order total
          const newPaymentStatus =
            totalPaid >= selectedOrder.total
              ? PaymentStatus.PAID
              : PaymentStatus.PARTIAL;
          await updateExistingOrder(selectedOrder.id, {
            paymentStatus: newPaymentStatus,
          });
        } else {
          // This shouldn't happen in normal flow, but handle it gracefully
          console.warn("No selected order found during payment processing");
        }

        // On success:
        setPaymentSuccessData({ totalPaid });
        setShowPaymentSuccessDialog(true);
        setCurrentView("items");
      } catch (error) {
        console.error("Error processing payments:", error);
        throw error; // re-throw for POSPaymentView to catch
      } finally {
        setIsProcessing(false);
      }
    },
    [
      selectedOrder,
      addPaymentToOrder,
      updateExistingOrder,
      setCurrentView,
      setIsProcessing,
    ],
  );

  const handleClearCart = useCallback(() => {
    setCartItems([]);
    setCurrentQueueNumber(null);
  }, [setCartItems, setCurrentQueueNumber]);

  const handleBackToItems = useCallback(() => {
    resetAllState();
  }, [resetAllState]);

  // New function that preserves cart when navigating back to POS
  const handleBackToItemsPreserveCart = useCallback(() => {
    setCurrentView("items");
    setCategoryPath([]);
    // Do NOT clear these if a saved order is loaded
    if (!isSavedOrderLoaded) {
      setSelectedTable(null);
      setSelectedCustomer(null);
      setSelectedOrder(null);
    }
  }, [
    setCurrentView,
    setCategoryPath,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrder,
    isSavedOrderLoaded,
  ]);

  const handleOrderToggle = useCallback(() => {
    // If we are on the items view AND we are NOT editing a saved order,
    // then the button means "start a new order".
    if (currentView === "items" && !isSavedOrderLoaded) {
      resetAllState();
    } else {
      // Otherwise, it just means "go to the items view".
      setCurrentView("items");
      setCategoryPath([]);
    }
  }, [
    currentView,
    isSavedOrderLoaded,
    resetAllState,
    setCurrentView,
    setCategoryPath,
  ]);

  const handleTableDeselect = useCallback(() => {
    setSelectedTable(null);
    if (selectedOrder) {
      setSelectedOrder((prevOrder) =>
        prevOrder
          ? { ...prevOrder, tableId: undefined, tableName: undefined }
          : null,
      );
      setIsSavedOrderModified(true);
    }
  }, [
    setSelectedTable,
    selectedOrder,
    setSelectedOrder,
    setIsSavedOrderModified,
  ]);

  const handleCustomerDeselect = useCallback(() => {
    setSelectedCustomer(null);
    if (selectedOrder) {
      setIsSavedOrderModified(true);
    }
  }, [setSelectedCustomer, selectedOrder]);

  const handleOrderTypeDeselect = useCallback(() => {
    setSelectedOrderType(null);
  }, [setSelectedOrderType]);

  const handleTableSelect = useCallback(() => {
    setCurrentView("tables");
  }, [setCurrentView]);

  const handleCustomerSelect = useCallback(() => {
    setCurrentView("customers");
  }, [setCurrentView]);

  const handleOrdersClick = useCallback(() => {
    setCurrentView("orders");
  }, [setCurrentView]);

  const handleCategoryClick = useCallback(
    (categoryId: string) => {
      setCategoryPath([...categoryPath, categoryId]);
    },
    [setCategoryPath, categoryPath],
  );

  const handleNavigateToRoot = useCallback(() => {
    setCategoryPath([]);
  }, [setCategoryPath]);

  const handleNavigateToPath = useCallback(
    (path: string[]) => {
      setCategoryPath(path);
    },
    [setCategoryPath],
  );

  const handlePayOrder = useCallback(async () => {
    console.log("--- handlePayOrder --- ", {
      isSavedOrderLoaded,
      isSavedOrderModified,
      selectedOrderId: selectedOrder?.id,
      selectedOrderPaymentStatus: selectedOrder?.paymentStatus,
    });

    if ((cartItems || []).length === 0) return;
    if (!organizationId) {
      console.error("No organization selected");
      return;
    }

    setIsProcessing(true);
    try {
      let orderToPay: Order;

      // First, calculate totals based on the CURRENT cart
      const taxRate = vatSettings?.rate || 15;
      const isVatEnabled = vatSettings?.isEnabled || false;
      const isVatInclusive = vatSettings?.isVatInclusive || false;
      let subtotal, taxAmount, total;

      if (isVatEnabled) {
        const itemsForCalculation = (cartItems || []).map((item) => ({
          price: item.unitPrice,
          quantity: item.quantity,
        }));
        const result = calculateCartTotals(
          itemsForCalculation,
          taxRate,
          isVatInclusive,
        );
        subtotal = result.subtotal;
        taxAmount = result.vatAmount;
        total = result.total;
      } else {
        subtotal = cartSubtotal;
        taxAmount = 0;
        total = subtotal;
      }

      if (isSavedOrderLoaded && selectedOrder) {
        // An order is reopened. Update it with the current cart state before paying.
        let newPaymentStatus = selectedOrder.paymentStatus;
        if (
          isSavedOrderModified &&
          selectedOrder.paymentStatus === PaymentStatus.PAID
        ) {
          newPaymentStatus = PaymentStatus.PARTIAL;
        }

        const orderDataToUpdate = {
          items: cartItems,
          subtotal,
          taxRate,
          taxAmount,
          total,
          paymentStatus: newPaymentStatus,
          orderType: selectedOrderType?.name || selectedOrder.orderType,
          customerName: selectedCustomer?.name || undefined,
          customerPhone: selectedCustomer?.phone || undefined,
          customerEmail: selectedCustomer?.email || undefined,
          ...(selectedTable?.id && { tableId: selectedTable.id }),
          ...(selectedTable?.name && { tableName: selectedTable.name }),
          updatedAt: new Date(),
        };
        await updateExistingOrder(selectedOrder.id, orderDataToUpdate);
        orderToPay = { ...selectedOrder, ...orderDataToUpdate };
        setIsSavedOrderModified(false); // Reset modified flag after update
      } else {
        // This is a new order. Create it.
        const queueNumber = nextQueueNumber.toString();
        const orderData: Omit<Order, "id" | "paymentStatus"> = {
          organizationId,
          orderNumber: `ORD-${Date.now()}`,
          queueNumber: queueNumber,
          items: cartItems,
          subtotal,
          taxRate,
          taxAmount,
          total,
          status: OrderStatus.OPEN,
          orderType: selectedOrderType?.name || "dine-in",
          ...(selectedCustomer?.name && {
            customerName: selectedCustomer.name,
          }),
          ...(selectedCustomer?.phone && {
            customerPhone: selectedCustomer.phone,
          }),
          ...(selectedCustomer?.email && {
            customerEmail: selectedCustomer.email,
          }),
          ...(selectedTable?.id && { tableId: selectedTable.id }),
          ...(selectedTable?.name && { tableName: selectedTable.name }),
          createdById: user?.uid || "unknown",
          createdByName:
            userName || user?.displayName || user?.email || "Unknown User",
          createdAt: new Date(),
          updatedAt: new Date(),
          selectedDate: selectedDate,
        };

        const orderDataToCreate = {
          ...orderData,
          paymentStatus: PaymentStatus.UNPAID,
        };
        const newOrderId = await createNewOrder(orderDataToCreate);
        orderToPay = { ...orderDataToCreate, id: newOrderId };

        const newQueueNumber = nextQueueNumber + 1;
        setNextQueueNumber(newQueueNumber);
      }

      setSelectedOrder(orderToPay);
      setCurrentView("payment");
    } catch (error) {
      console.error("Error in pay order flow:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [
    cartItems,
    cartSubtotal,
    selectedOrder,
    selectedOrderType,
    selectedCustomer,
    selectedTable,
    organizationId,
    user,
    userName,
    nextQueueNumber,
    vatSettings,
    createNewOrder,
    updateExistingOrder,
    setNextQueueNumber,
    setSelectedOrder,
    setCurrentView,
    calculateCartTotals,
    setIsProcessing,
    isSavedOrderLoaded,
    setIsSavedOrderModified,
  ]);

  const updateCartItem = useCallback(
    (itemId: string, type: string, updates: Partial<CartItem>) => {
      const updatedCart = cartItems.map((item) =>
        item.id === itemId && item.type === type
          ? { ...item, ...updates }
          : item,
      );
      setCartItems(updatedCart);
      if (isSavedOrderLoaded) {
        setIsSavedOrderModified(true);
      }
    },
    [cartItems, setCartItems, isSavedOrderLoaded, setIsSavedOrderModified],
  );

  const removeFromCart = useCallback(
    (itemId: string, type: string) => {
      const updatedCart = cartItems.filter(
        (item) => !(item.id === itemId && item.type === type),
      );
      setCartItems(updatedCart);
      if (isSavedOrderLoaded) {
        setIsSavedOrderModified(true);
      }
    },
    [cartItems, setCartItems, isSavedOrderLoaded, setIsSavedOrderModified],
  );

  const handleClearSelectedOrder = useCallback(() => {
    setSelectedOrder(null);
    resetAllState();
  }, [setSelectedOrder, resetAllState]);

  // Loading state - exclude ordersLoading when viewing orders to prevent stuck loading
  const loading =
    itemsLoading ||
    categoriesLoading ||
    tablesLoading ||
    customersLoading ||
    (currentView !== "orders" ? ordersLoading : false) ||
    storeSettingsLoading;

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground text-lg">Loading POS...</p>
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
      {isProcessing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-lg">
            <Loader2 className="h-6 w-6 animate-spin" />
            Processing...
          </div>
        </div>
      )}
      <POSLeftColumn>
        <POSHeaderContainer>
          <POSHeader
            cartItems={cartForComponents}
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
            onOrdersClick={handleOrdersClick}
            onOrderTypeDeselect={handleOrderTypeDeselect}
            onOrderToggle={handleOrderToggle}
            onClearSelectedOrder={handleClearSelectedOrder}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
            isOnPOSPage={true}
            currentView={currentView}
          />
        </POSHeaderContainer>

        <POSMainContent>
          <POSViewsManager
            currentView={
              currentView as import("./components/POSViewsManager").POSViewType
            }
            items={items}
            categories={categories}
            tables={tables}
            customers={customers}
            orders={orders}
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
            onOrderSelect={handleViewOrderDetail}
            onReopenOrder={handleOrderReopen}
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
              itemId: item.id,
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

      <BusinessDaySelectionDialog
        open={showDateSelectionDialog}
        onOpenChange={setShowDateSelectionDialog}
        onDateSelect={handleDateChange}
        currentDate={selectedDate ? new Date(selectedDate) : null}
        title="Select Business Date"
        description="Please select a business date to record sales"
      />
    </POSLayout>
  );
}
