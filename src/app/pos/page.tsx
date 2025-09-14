'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { addDoc, getDoc, doc, collection, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { TableStatus, OrderStatus, ItemType } from '@/types';
import { usePOSPersistence, CartItem } from '@/hooks/use-pos-persistence';
import { useProductsData } from '@/hooks/use-products-data';
import { useServicesData } from '@/hooks/use-services-data';
import { useCategoriesData } from '@/hooks/use-categories-data';
import { useTablesData, useTableActions } from '@/hooks/use-tables-data';
import { useCustomersData } from '@/hooks/use-customers-data';
import { useOrdersData } from '@/hooks/use-orders-data';
import { usePaymentTypesData } from '@/hooks/use-payment-types-data';
import { useOrderTypesData } from '@/hooks/use-order-types-data';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';
import { usePrinterSettingsData } from '@/hooks/use-printer-settings-data';
import { useOrganizationData } from '@/hooks/use-organization-data';
import { Product, Service, Category, Table, Customer, Order, OrderPayment, PaymentType, OrderType, ReceiptTemplate, PrinterSettings, Organization } from '@/types';

import { POSBreadcrumb } from '@/components/POSBreadcrumb';
import { POSCategoriesGrid } from '@/components/POSCategoriesGrid';
import { POSItemsGrid } from '@/components/POSItemsGrid';
import { POSCartSidebar } from '@/components/POSCartSidebar';
import { POSTableGrid } from '@/components/POSTableGrid';
import { POSCustomerGrid } from '@/components/POSCustomerGrid';
import { POSOrderGrid } from '@/components/POSOrderGrid';
import { POSPaymentGrid } from '@/components/POSPaymentGrid';
import { OrderTypeSelectionDialog } from '@/components/OrderTypeSelectionDialog';
import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';
import { CartItemModal } from '@/components/CartItemModal';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ShoppingCart, LayoutGrid, Users, ShoppingBag, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';


export default function POSPage() {
  const { organizationId, user } = useAuth();

  // Use the POS persistence hook for all POS state
  const {
    cart,
    selectedTable,
    selectedCustomer,
    selectedOrderType,
    currentView,
    categoryPath,
    selectedOrder,
    setCart,
    setSelectedTable,
    setSelectedCustomer,
    setSelectedOrderType,
    setCurrentView,
    setCategoryPath,
    setSelectedOrder,
    clearPOSData,
    clearCart
  } = usePOSPersistence(organizationId || undefined);

  const [loading, setLoading] = useState(true);
  const [pendingOrderToReopen, setPendingOrderToReopen] = useState<Order | null>(null);
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Use new hooks for data management
  const { products, loading: productsLoading } = useProductsData(organizationId || undefined);
  const { services, loading: servicesLoading } = useServicesData(organizationId || undefined);
  const { categories, loading: categoriesLoading } = useCategoriesData(organizationId || undefined);
  const { tables, loading: tablesLoading } = useTablesData(organizationId || undefined);
  const { updateTable } = useTableActions(organizationId || undefined);
  const { customers, loading: customersLoading } = useCustomersData(organizationId || undefined);
  const { orders, loading: ordersLoading } = useOrdersData(organizationId || undefined);
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypesData(organizationId || undefined);
  const { orderTypes, loading: orderTypesLoading } = useOrderTypesData(organizationId || undefined);
  const { receiptTemplates, loading: receiptTemplatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const { printerSettings, loading: printerSettingsLoading } = usePrinterSettingsData(organizationId || undefined);
  const { organization, loading: organizationLoading } = useOrganizationData(organizationId || undefined);

  // Update loading state based on all data sources
  useEffect(() => {
    const allDataLoaded = !productsLoading && !servicesLoading && !categoriesLoading && 
                         !tablesLoading && !customersLoading && !ordersLoading &&
                         !paymentTypesLoading && !orderTypesLoading && !receiptTemplatesLoading &&
                         !printerSettingsLoading && !organizationLoading;
    setLoading(!allDataLoaded);
  }, [productsLoading, servicesLoading, categoriesLoading, tablesLoading, customersLoading, 
      ordersLoading, paymentTypesLoading, orderTypesLoading, receiptTemplatesLoading, 
      printerSettingsLoading, organizationLoading]);

  // Set default order type when order types are loaded
  useEffect(() => {
    if (orderTypes && orderTypes.length > 0 && !selectedOrderType) {
      const savedOrderTypeKey = organizationId ? `${organizationId}_posOrderType` : 'posOrderType';
      const savedOrderType = localStorage.getItem(savedOrderTypeKey);
      
      if (savedOrderType) {
        try {
          const parsedOrderType = JSON.parse(savedOrderType);
          setSelectedOrderType(parsedOrderType);
        } catch (error) {
          console.error('Error loading order type from localStorage:', error);
          setSelectedOrderType(orderTypes[0]);
        }
      } else {
        setSelectedOrderType(orderTypes[0]);
      }
    }
  }, [orderTypes, selectedOrderType, organizationId, setSelectedOrderType]);


  // Calculate cart total
  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + item.total, 0);



  // Debug cart persistence
  useEffect(() => {
    console.log('POSPage: Cart state changed:', cart);
    console.log('POSPage: organizationId:', organizationId);
    const cartKey = organizationId ? `${organizationId}_posCart` : 'posCart';
    console.log('POSPage: Looking for cart with key:', cartKey);
    console.log('POSPage: Cart in localStorage:', localStorage.getItem(cartKey));
  }, [cart, organizationId]);

  // Add item to cart
  const addToCart = (item: Product | Service, type: 'product' | 'service') => {
      const itemType = type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE;
      const price = itemType === ItemType.PRODUCT ? item.price : (item as Service).price;
    const existingItem = cart.find((cartItem: CartItem) =>
      cartItem.id === item.id && cartItem.type === type
    );

    if (existingItem) {
      setCart(cart.map((cartItem: CartItem) =>
        cartItem.id === item.id && cartItem.type === type
          ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * price }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        type,
        name: item.name,
        price,
        quantity: 1,
        total: price
      }]);
    }
  };

  // Navigation handlers
  const navigateToCategory = (categoryId: string) => {
    if (categoryId === 'uncategorized') {
      // Special handling for uncategorized items - we'll use a special path
      setCategoryPath(['uncategorized']);
    } else {
      setCategoryPath([...categoryPath, categoryId]);
    }
  };

  const navigateToRoot = () => {
    setCategoryPath([]);
  };

  // Table and customer selection handlers
  const handleTableSelect = () => {
    setCurrentView('tables');
  };

  const handleCustomerSelect = () => {
    setCurrentView('customers');
  };

  const handleTableSelected = (table: Table) => {
    setSelectedTable(table);
    setCurrentView('items');
  };

  const handleCustomerSelected = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentView('items');
  };

  const handleBackToItems = () => {
    setCurrentView('items');
  };

  const handleOrdersClick = () => {
    setCurrentView('orders');
  };

  const handleOrderTypeSelect = (orderType: OrderType) => {
    setSelectedOrderType(orderType);
  };

  const handleTableDeselect = () => {
    setSelectedTable(null);
  };

  const handleCustomerDeselect = () => {
    setSelectedCustomer(null);
  };

  const handleOrderTypeDeselect = () => {
    setSelectedOrderType(null);
  };

  const handleOrderReopen = (order: Order) => {
    // Check if there are items in the current cart
    if (cart.length > 0) {
      // Show confirmation dialog
      setPendingOrderToReopen(order);
      setShowOrderConfirmationDialog(true);
    } else {
      // No items in cart, proceed directly
      proceedWithOrderReopen(order);
    }
  };

  const proceedWithOrderReopen = (order: Order) => {
    // Convert order items back to cart items
    const cartItems: CartItem[] = order.items.map(orderItem => ({
      id: orderItem.productId || orderItem.serviceId || orderItem.id,
      type: orderItem.type,
      name: orderItem.name,
      price: orderItem.unitPrice,
      quantity: orderItem.quantity,
      total: orderItem.total,
    }));

    setCart(cartItems);
    setCurrentView('items');
    setPendingOrderToReopen(null);
    setShowOrderConfirmationDialog(false);
  };

  const handleSaveCurrentOrder = async () => {
    if (!pendingOrderToReopen || !organizationId) return;
    
    // Save the current cart first
    await handleSaveOrder();
    
    // Then reopen the selected order
    proceedWithOrderReopen(pendingOrderToReopen);
  };

  const handleDiscardCurrentOrder = () => {
    if (!pendingOrderToReopen) return;
    
    // Discard current cart and reopen the selected order
    proceedWithOrderReopen(pendingOrderToReopen);
  };

  const handleClearCart = () => clearCart();

  // Cart item operation handlers
  const [selectedCartItem, setSelectedCartItem] = useState<CartItem | null>(null);
  const [showQuantityModal, setShowQuantityModal] = useState(false);

  const handleCartItemClick = (item: CartItem) => {
    setSelectedCartItem(item);
    setShowQuantityModal(true);
  };

  const handleQuantityUpdate = (newQuantity: number) => {
    if (!selectedCartItem || newQuantity <= 0) return;

    setCart(cart.map(cartItem =>
      cartItem.id === selectedCartItem.id && cartItem.type === selectedCartItem.type
        ? { ...cartItem, quantity: newQuantity, total: newQuantity * cartItem.price }
        : cartItem
    ));

    setSelectedCartItem(null);
    setShowQuantityModal(false);
  };

  const handleQuantityModalClose = () => {
    setSelectedCartItem(null);
    setShowQuantityModal(false);
  };

  const handlePaymentClick = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('payment');
  };

  const handlePaymentProcessed = async (payments: OrderPayment[]) => {
    if (!selectedOrder || !organizationId) return;

    try {
      let orderToUpdate = selectedOrder;

      // If this is a temporary order (from checkout), save it first
      if (selectedOrder.id.startsWith('temp')) {
        const orderData = {
          ...selectedOrder,
          status: OrderStatus.SAVED,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // Remove temp ID so Firebase can generate a real one
        const { id, ...orderDataWithoutId } = orderData;

        const orderRef = await addDoc(collection(db, 'organizations', organizationId, 'orders'), orderDataWithoutId);
        const savedOrder = { ...orderData, id: orderRef.id };

        // Update payments to reference the real order ID
        payments.forEach(payment => {
          payment.orderId = savedOrder.id;
        });

        orderToUpdate = savedOrder;
      }

      // Save payments to Firebase
      const paymentPromises = payments.map(payment =>
        addDoc(collection(db, 'organizations', organizationId, 'orderPayments'), payment)
      );
      await Promise.all(paymentPromises);

      // Update order status to completed
      await updateDoc(doc(db, 'organizations', organizationId, 'orders', orderToUpdate.id), {
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
      });

      toast.success('Payment processed successfully! Order marked as completed.');
      setSelectedOrder(null);
      setCurrentView('items');
      // Clear all POS data after successful payment (cart, table, customer, etc.)
      clearPOSData();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    }
  };


  const handleSaveOrder = async () => {
    if (cart.length === 0 || !organizationId) return;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Convert cart items to order items
    const orderItems = cart.map(cartItem => {
      const orderItem: {
        id: string;
        type: 'product' | 'service';
        name: string;
        quantity: number;
        unitPrice: number;
        total: number;
        productId?: string;
        serviceId?: string;
      } = {
        id: `${cartItem.type}-${cartItem.id}`,
        type: cartItem.type,
        name: cartItem.name,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        total: cartItem.total,
      };
      
      if (cartItem.type === ItemType.PRODUCT) {
        orderItem.productId = cartItem.id;
      } else if (cartItem.type === ItemType.SERVICE) {
        orderItem.serviceId = cartItem.id;
      }
      
      return orderItem;
    });

    // Calculate totals
    const subtotal = cartTotal;
    const taxRate = 0; // TODO: Get from settings
    const taxAmount = 0; // TODO: Calculate based on tax rate
    const total = subtotal + taxAmount;

    const orderData = {
      orderNumber,
      items: orderItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: OrderStatus.SAVED,
      ...(selectedCustomer && {
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerEmail: selectedCustomer.email,
      }),
      ...(selectedTable && {
        tableId: selectedTable.id,
        tableName: selectedTable.name,
      }),
      orderType: selectedOrderType?.name || 'dine-in',
      organizationId,
      createdById: user?.uid || 'unknown',
      createdByName: user?.displayName || user?.email || 'Unknown User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      // Create the order
      await addDoc(collection(db, 'organizations', organizationId, 'orders'), orderData);
      
      // Update table status to occupied if a table is selected
      if (selectedTable && selectedTable.id) {
        await updateTable(selectedTable.id, { status: TableStatus.OCCUPIED });
      }
      
      toast.success('Order saved successfully!');
      // Clear all POS data after successful save
      clearPOSData();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order. Please try again.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="h-screen bg-background grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0">
      {/* Left Column - Header + Main Content */}
      <div className="flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-card shadow p-4 border-b border-r lg:border-r-0">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground">POS</h1>
            <div className="flex items-center space-x-4">
              {/* Mobile Cart Toggle */}
              <div className="lg:hidden">
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cart.length}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full max-w-sm p-0">
                    <SheetTitle className="sr-only">Shopping Cart</SheetTitle>
                    <POSCartSidebar
                      cart={cart}
                      cartTotal={cartTotal}
                       onCheckout={() => {
                         if (cart.length === 0) return;

                         // Create a temporary order from cart for payment processing
                         const tempOrder: Order = {
                           id: 'temp-checkout',
                           organizationId: organizationId || '',
                           orderNumber: `TEMP-${Date.now()}`,
                            items: cart.map(item => ({
                              id: `${item.type}-${item.id}`,
                              type: item.type === ItemType.PRODUCT ? ItemType.PRODUCT : ItemType.SERVICE,
                              productId: item.type === ItemType.PRODUCT ? item.id : undefined,
                              serviceId: item.type === ItemType.SERVICE ? item.id : undefined,
                              name: item.name,
                              quantity: item.quantity,
                              unitPrice: item.price,
                             total: item.total,
                           })),
                           subtotal: cartTotal,
                           taxRate: 0, // TODO: Get from settings
                           taxAmount: 0, // TODO: Calculate based on tax rate
                           total: cartTotal,
                            status: OrderStatus.OPEN,
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

                         setSelectedOrder(tempOrder);
                         setCurrentView('payment');
                         setIsCartOpen(false);
                       }}
                      onSaveOrder={() => {
                        handleSaveOrder();
                        setIsCartOpen(false);
                      }}
                      onPrintReceipt={async () => {
                        // Check if receipt templates exist, create a default one if not
                        if (receiptTemplates.length === 0 && organizationId) {
                          try {
                            const defaultTemplateContent = '<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset="utf-8">\\n  <title>Receipt</title>\\n  <style>\\n    body { font-family: monospace; margin: 0; padding: 10px; }\\n    .header { text-align: center; margin-bottom: 10px; }\\n    .content { margin-bottom: 10px; }\\n    .footer { text-align: center; margin-top: 10px; }\\n    .line { display: flex; justify-content: space-between; }\\n    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }\\n  </style>\\n</head>\\n<body>\\n  <div class="header">\\n    <h2>{{companyName}}</h2>\\n    <p>{{companyAddress}}</p>\\n    <p>Tel: {{companyPhone}}</p>\\n    <p>VAT: {{companyVat}}</p>\\n    <hr>\\n    <p>Order #: {{orderNumber}}</p>\\n    <p>Date: {{orderDate}}</p>\\n    <p>Table: {{tableName}}</p>\\n    <p>Customer: {{customerName}}</p>\\n    <hr>\\n  </div>\\n  \\n  <div class="content">\\n    {{#each items}}\\n    <div class="line">\\n      <span>{{name}} ({{quantity}}x)</span>\\n      <span>{{total}}</span>\\n    </div>\\n    {{/each}}\\n  </div>\\n  \\n  <div class="total">\\n    <div class="line">\\n      <span>Subtotal:</span>\\n      <span>{{subtotal}}</span>\\n    </div>\\n    <div class="line">\\n      <span>VAT ({{vatRate}}%):</span>\\n      <span>{{vatAmount}}</span>\\n    </div>\\n    <div class="line">\\n      <span>TOTAL:</span>\\n      <span>{{total}}</span>\\n    </div>\\n  </div>\\n  \\n  <div class="footer">\\n    <p>Payment: {{paymentMethod}}</p>\\n    <p>Thank you for your business!</p>\\n  </div>\\n</body>\\n</html>';

                            await addDoc(collection(db, 'organizations', organizationId, 'receiptTemplates'), {
                              name: 'Default Receipt',
                              description: 'Default receipt template',
                              content: defaultTemplateContent,
                              type: 'thermal',
                              isDefault: true,
                              organizationId,
                              createdAt: new Date(),
                              updatedAt: new Date(),
                            });

                            // Show success message
                            toast.success('Default receipt template created successfully. Please try printing again.');
                            return;
                          } catch (error) {
                            console.error('Error creating default receipt template:', error);
                            toast.error('Error creating default receipt template. Please try again.');
                            return;
                          }
                        }

                        // Create a temporary order from cart for printing
                        const tempOrder: Order = {
                          id: 'temp',
                          organizationId: organizationId || '',
                          orderNumber: `TEMP-${Date.now()}`,
                          items: cart.map(item => ({
                            id: `${item.type}-${item.id}`,
                            type: item.type === ItemType.PRODUCT ? ItemType.PRODUCT : ItemType.SERVICE,
                            productId: item.type === ItemType.PRODUCT ? item.id : undefined,
                            serviceId: item.type === ItemType.SERVICE ? item.id : undefined,
                            name: item.name,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            total: item.total,
                          })),
                          subtotal: cartTotal,
                          taxRate: 0,
                          taxAmount: 0,
                          total: cartTotal,
                          status: OrderStatus.OPEN,
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
                        setSelectedOrder(tempOrder);
                        // Open the print dialog immediately after setting the order
                        setTimeout(() => {
                          const printTrigger = document.querySelector('[data-print-receipt-trigger]') as HTMLElement;
                          if (printTrigger) {
                            printTrigger.click();
                          }
                        }, 100);
                        setIsCartOpen(false);
                      }}
                      onClearCart={() => {
                        handleClearCart();
                        setIsCartOpen(false);
                      }}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              {/* Table Selection */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedTable ? "default" : "outline"}
                  size="sm"
                  onClick={handleTableSelect}
                  onDoubleClick={handleTableDeselect}
                  className={`flex items-center space-x-2 ${selectedTable ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span>
                    {selectedTable ? selectedTable.name : 'Table'}
                  </span>
                </Button>
              </div>

              {/* Customer Selection */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedCustomer ? "default" : "outline"}
                  size="sm"
                  onClick={handleCustomerSelect}
                  onDoubleClick={handleCustomerDeselect}
                  className={`flex items-center space-x-2 ${selectedCustomer ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                >
                  <Users className="h-4 w-4" />
                  <span>
                    {selectedCustomer ? selectedCustomer.name : 'Customer'}
                  </span>
                </Button>
              </div>

              {/* Order Type Selection */}
              <div className="flex items-center space-x-2">
                <OrderTypeSelectionDialog
                  orderTypes={orderTypes}
                  selectedOrderType={selectedOrderType}
                  onOrderTypeSelect={handleOrderTypeSelect}
                >
                  <Button
                    variant={selectedOrderType ? "default" : "outline"}
                    size="sm"
                    onDoubleClick={handleOrderTypeDeselect}
                    className={`flex items-center space-x-2 ${selectedOrderType ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      {selectedOrderType ? selectedOrderType.name : 'Order Type'}
                    </span>
                  </Button>
                </OrderTypeSelectionDialog>
              </div>

              {/* Orders Button */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOrdersClick}
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Orders</span>
                </Button>
              </div>
            </div>
           </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 overflow-hidden">
        {currentView === 'items' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0">
            {/* Items Grid */}
            <div className="overflow-auto bg-background">
              {/* Breadcrumb - only shown in items view */}
              <POSBreadcrumb
                categoryPath={categoryPath}
                categories={categories}
                onNavigateToRoot={navigateToRoot}
                onNavigateToPath={setCategoryPath}
              />

              <div className="p-4">
              {categoryPath.length === 0 ? (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Categories</h3>
                    <POSCategoriesGrid
                      categories={categories}
                      products={products}
                      services={services}
                      categoryPath={categoryPath}
                      onCategoryClick={navigateToCategory}
                    />
                  </div>

                  {/* Uncategorized Items Section at Root Level */}
                  {(products.filter(p => !p.categoryId).length > 0 || services.filter(s => !s.categoryId).length > 0) && (
                    <POSItemsGrid
                      categories={categories}
                      products={products}
                      services={services}
                      categoryPath={['uncategorized']}
                      onCategoryClick={navigateToCategory}
                      onItemClick={addToCart}
                    />
                  )}
                </div>
              ) : (
                <POSItemsGrid
                  categories={categories}
                  products={products}
                  services={services}
                  categoryPath={categoryPath}
                  onCategoryClick={navigateToCategory}
                  onItemClick={addToCart}
                />
              )}
              </div>
            </div>


          </div>
        )}

        {currentView === 'tables' && (
          <POSTableGrid
            tables={tables}
            onTableSelect={handleTableSelected}
            onBack={handleBackToItems}
          />
        )}

        {currentView === 'customers' && (
          <POSCustomerGrid
            customers={customers}
            onCustomerSelect={handleCustomerSelected}
            onBack={handleBackToItems}
          />
        )}

        {currentView === 'orders' && (
          <POSOrderGrid
            orders={orders.filter(order => order.status === OrderStatus.SAVED)}
            onOrderSelect={handleOrderReopen}
            onPaymentClick={handlePaymentClick}
            onBack={handleBackToItems}
          />
        )}

        {currentView === 'payment' && selectedOrder && (
          <POSPaymentGrid
            order={selectedOrder}
            paymentTypes={paymentTypes}
            onPaymentProcessed={handlePaymentProcessed}
            onBack={() => setCurrentView('orders')}
          />
        )}
        </div>
      </div>

      {/* Right Column - Full Height Sidebar */}
      <div className="hidden lg:block h-screen">
        <POSCartSidebar
          cart={cart}
          cartTotal={cartTotal}
           onCheckout={() => {
             if (cart.length === 0) return;

             // Create a temporary order from cart for payment processing
             const tempOrder: Order = {
               id: 'temp-checkout',
               organizationId: organizationId || '',
               orderNumber: `TEMP-${Date.now()}`,
              items: cart.map(item => ({
                id: `${item.type}-${item.id}`,
                type: item.type === ItemType.PRODUCT ? ItemType.PRODUCT : ItemType.SERVICE,
                productId: item.type === ItemType.PRODUCT ? item.id : undefined,
                serviceId: item.type === ItemType.SERVICE ? item.id : undefined,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.total,
              })),
               subtotal: cartTotal,
               taxRate: 0, // TODO: Get from settings
               taxAmount: 0, // TODO: Calculate based on tax rate
               total: cartTotal,
               status: OrderStatus.OPEN,
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

             setSelectedOrder(tempOrder);
             setCurrentView('payment');
           }}
          onSaveOrder={handleSaveOrder}
          onPrintReceipt={async () => {
            // Check if receipt templates exist, create a default one if not
            if (receiptTemplates.length === 0 && organizationId) {
              try {
                const defaultTemplateContent = '<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset="utf-8">\\n  <title>Receipt</title>\\n  <style>\\n    body { font-family: monospace; margin: 0; padding: 10px; }\\n    .header { text-align: center; margin-bottom: 10px; }\\n    .content { margin-bottom: 10px; }\\n    .footer { text-align: center; margin-top: 10px; }\\n    .line { display: flex; justify-content: space-between; }\\n    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }\\n  </style>\\n</head>\\n<body>\\n  <div class="header">\\n    <h2>{{companyName}}</h2>\\n    <p>{{companyAddress}}</p>\\n    <p>Tel: {{companyPhone}}</p>\\n    <p>VAT: {{companyVat}}</p>\\n    <hr>\\n    <p>Order #: {{orderNumber}}</p>\\n    <p>Date: {{orderDate}}</p>\\n    <p>Table: {{tableName}}</p>\\n    <p>Customer: {{customerName}}</p>\\n    <hr>\\n  </div>\\n  \\n  <div class="content">\\n    {{#each items}}\\n    <div class="line">\\n      <span>{{name}} ({{quantity}}x)</span>\\n      <span>{{total}}</span>\\n    </div>\\n    {{/each}}\\n  </div>\\n  \\n  <div class="total">\\n    <div class="line">\\n      <span>Subtotal:</span>\\n      <span>{{subtotal}}</span>\\n    </div>\\n    <div class="line">\\n      <span>VAT ({{vatRate}}%):</span>\\n      <span>{{vatAmount}}</span>\\n    </div>\\n    <div class="line">\\n      <span>TOTAL:</span>\\n      <span>{{total}}</span>\\n    </div>\\n  </div>\\n  \\n  <div class="footer">\\n    <p>Payment: {{paymentMethod}}</p>\\n    <p>Thank you for your business!</p>\\n  </div>\\n</body>\\n</html>';

                await addDoc(collection(db, 'organizations', organizationId, 'receiptTemplates'), {
                  name: 'Default Receipt',
                  description: 'Default receipt template',
                  content: defaultTemplateContent,
                  type: 'thermal',
                  isDefault: true,
                  organizationId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });

                // Show success message
                toast.success('Default receipt template created successfully. Please try printing again.');
                return;
              } catch (error) {
                console.error('Error creating default receipt template:', error);
                toast.error('Error creating default receipt template. Please try again.');
                return;
              }
            }

            // Create a temporary order from cart for printing
            const tempOrder: Order = {
              id: 'temp',
              organizationId: organizationId || '',
              orderNumber: `TEMP-${Date.now()}`,
              items: cart.map(item => ({
                id: `${item.type}-${item.id}`,
                type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
                productId: item.type === ItemType.PRODUCT ? item.id : undefined,
                serviceId: item.type === ItemType.SERVICE ? item.id : undefined,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.price,
                total: item.total,
              })),
              subtotal: cartTotal,
              taxRate: 0,
              taxAmount: 0,
              total: cartTotal,
              status: OrderStatus.OPEN,
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
            setSelectedOrder(tempOrder);
            // Open the print dialog immediately after setting the order
            setTimeout(() => {
              const printTrigger = document.querySelector('[data-print-receipt-trigger]') as HTMLElement;
              if (printTrigger) {
                printTrigger.click();
              }
            }, 100);
          }}
          onClearCart={handleClearCart}
        />
      </div>

      {/* Order Reopen Confirmation Dialog */}
      <AlertDialog open={showOrderConfirmationDialog} onOpenChange={setShowOrderConfirmationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have {cart.length} item(s) in your current cart. Reopening another order will replace your current cart.
              Would you like to save your current order first, or discard it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDiscardCurrentOrder}>
              Discard Current Order
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveCurrentOrder}>
              Save & Reopen Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Print Dialog - for completed orders */}
      {selectedOrder && (
        <ReceiptPrintDialog
          order={selectedOrder}
          organization={organization}
          receiptTemplates={receiptTemplates}
          printerSettings={printerSettings}
        >
          <Button className="hidden" />
        </ReceiptPrintDialog>
      )}

      {/* Cart Item Modal for quantity management */}
      <CartItemModal
        item={selectedCartItem}
        isOpen={showQuantityModal}
        onClose={handleQuantityModalClose}
        onUpdateQuantity={(itemId, newQuantity) => handleQuantityUpdate(newQuantity)}
        onDeleteItem={(itemId) => {
          if (selectedCartItem) {
            setCart(cart.filter(cartItem =>
              !(cartItem.id === selectedCartItem.id && cartItem.type === selectedCartItem.type)
            ));
          }
        }}
      />
    </div>
  );
}