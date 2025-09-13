'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Service, Category, Table, Customer, Order, OrderPayment, PaymentType, OrderType, ReceiptTemplate, PrinterSettings, Tenant } from '@/types';
import { POSHeader } from '@/components/POSHeader';
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
import { Button } from '@/components/ui/button';
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

interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export default function POSPage() {
  const { tenantId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentView, setCurrentView] = useState<'items' | 'tables' | 'customers' | 'orders' | 'payment'>('items');
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [pendingOrderToReopen, setPendingOrderToReopen] = useState<Order | null>(null);
  const [showOrderConfirmationDialog, setShowOrderConfirmationDialog] = useState(false);
  const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Fetch data from Firebase
  useEffect(() => {
    if (!tenantId) return;

    // Fetch products
    const productsQ = query(collection(db, 'tenants', tenantId, 'products'));
    const productsUnsubscribe = onSnapshot(productsQ, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const productsData = querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(productsData);
    });

    // Fetch services
    const servicesQ = query(collection(db, 'tenants', tenantId, 'services'));
    const servicesUnsubscribe = onSnapshot(servicesQ, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const servicesData = querySnapshot.docs.map((doc: DocumentData) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(servicesData);
    });

    // Fetch categories from Firebase
    const categoriesQ = query(collection(db, 'tenants', tenantId, 'categories'));
    const categoriesUnsubscribe = onSnapshot(categoriesQ, (querySnapshot) => {
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[];
      
      setCategories(categoriesData);
    });

    // Fetch tables
    const tablesQ = query(collection(db, 'tenants', tenantId, 'tables'));
    const tablesUnsubscribe = onSnapshot(tablesQ, (querySnapshot) => {
      const tablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Table[];
      setTables(tablesData);
    });

    // Fetch customers
    const customersQ = query(collection(db, 'tenants', tenantId, 'customers'));
    const customersUnsubscribe = onSnapshot(customersQ, (querySnapshot) => {
      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Customer[];
      setCustomers(customersData);
    });

    // Fetch orders
    const ordersQ = query(collection(db, 'tenants', tenantId, 'orders'));
    const ordersUnsubscribe = onSnapshot(ordersQ, (querySnapshot) => {
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Order[];
      setOrders(ordersData);
    });

    // Fetch payment types
    const paymentTypesQ = query(collection(db, 'tenants', tenantId, 'paymentTypes'));
    const paymentTypesUnsubscribe = onSnapshot(paymentTypesQ, (querySnapshot) => {
      const paymentTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as PaymentType[];
      setPaymentTypes(paymentTypesData);
    });

    // Fetch order types
    const orderTypesQ = query(collection(db, 'tenants', tenantId, 'orderTypes'));
    const orderTypesUnsubscribe = onSnapshot(orderTypesQ, async (querySnapshot) => {
      const orderTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as OrderType[];
      setOrderTypes(orderTypesData);

      // Set default order type if none selected and order types exist
      if (orderTypesData.length > 0 && !selectedOrderType) {
        setSelectedOrderType(orderTypesData[0]);
      }

    // Fetch printer settings
    const fetchPrinterSettings = async () => {
      const printerDoc = await getDoc(doc(db, 'tenants', tenantId, 'settings', 'printer'));
      if (printerDoc.exists()) {
        const printerData = printerDoc.data() as PrinterSettings;
        setPrinterSettings({
          ...printerData,
          createdAt: printerData.createdAt,
          updatedAt: printerData.updatedAt,
        });
      }
    };

    // Fetch tenant data
    const fetchTenantData = async () => {
      const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
      if (tenantDoc.exists()) {
        const tenantData = tenantDoc.data() as Tenant;
        setTenant({
          ...tenantData,
          createdAt: tenantData.createdAt,
          updatedAt: tenantData.updatedAt,
        });
      }
    };

    // Fetch receipt templates
    const receiptTemplatesQ = query(collection(db, 'tenants', tenantId, 'receiptTemplates'));
    const receiptTemplatesUnsubscribe = onSnapshot(receiptTemplatesQ, (querySnapshot) => {
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ReceiptTemplate[];
      setReceiptTemplates(templatesData);
    });

    await Promise.all([fetchPrinterSettings(), fetchTenantData()]);
    setLoading(false);
    });

    return () => {
      productsUnsubscribe();
      servicesUnsubscribe();
      categoriesUnsubscribe();
      tablesUnsubscribe();
      customersUnsubscribe();
      ordersUnsubscribe();
      paymentTypesUnsubscribe();
      orderTypesUnsubscribe();
    };

  }, [tenantId]);

  // Calculate cart total
  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + item.total, 0);

  // Add item to cart
  const addToCart = (item: Product | Service, type: 'product' | 'service') => {
    const price = type === 'product' ? item.price : (item as Service).price;
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
    if (!pendingOrderToReopen || !tenantId) return;
    
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

  const handlePaymentClick = (order: Order) => {
    setSelectedOrder(order);
    setCurrentView('payment');
  };

  const handlePaymentProcessed = async (payments: OrderPayment[]) => {
    if (!selectedOrder || !tenantId) return;

    try {
      // Save payments to Firebase
      const paymentPromises = payments.map(payment =>
        addDoc(collection(db, 'tenants', tenantId, 'orderPayments'), payment)
      );
      await Promise.all(paymentPromises);

      // Update order status to completed
      await addDoc(collection(db, 'tenants', tenantId, 'orders'), {
        ...selectedOrder,
        status: 'completed' as const,
        updatedAt: new Date(),
      });

      alert('Payment processed successfully! Order marked as completed.');
      setSelectedOrder(null);
      setCurrentView('orders');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment. Please try again.');
    }
  };

  const handleSaveOrder = async () => {
    if (cart.length === 0 || !tenantId) return;

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
      
      if (cartItem.type === 'product') {
        orderItem.productId = cartItem.id;
      } else if (cartItem.type === 'service') {
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
      status: 'saved' as const,
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
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'tenants', tenantId, 'orders'), orderData);
      alert('Order saved successfully!');
      // Clear cart after saving
      setCart([]);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Failed to save order. Please try again.');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      <POSHeader
        cart={cart}
        cartTotal={cartTotal}
        selectedTable={selectedTable}
        selectedCustomer={selectedCustomer}
        onTableSelect={handleTableSelect}
        onCustomerSelect={handleCustomerSelect}
        onOrdersClick={handleOrdersClick}
      />

      {/* Breadcrumb - only shown in items view */}
      {currentView === 'items' && (
        <POSBreadcrumb
          categoryPath={categoryPath}
          categories={categories}
          onNavigateToRoot={navigateToRoot}
          onNavigateToPath={setCategoryPath}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {currentView === 'items' && (
          <>
            {/* Items Grid */}
            <div className="flex-1 overflow-auto p-4 bg-background">
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

            <POSCartSidebar
              cart={cart}
              cartTotal={cartTotal}
              onCheckout={() => {}}
              onSaveOrder={handleSaveOrder}
              onPrintReceipt={() => {
                // Create a temporary order from cart for printing
                const tempOrder: Order = {
                  id: 'temp',
                  tenantId: tenantId || '',
                  orderNumber: `TEMP-${Date.now()}`,
                  items: cart.map(item => ({
                    id: `${item.type}-${item.id}`,
                    type: item.type,
                    productId: item.type === 'product' ? item.id : undefined,
                    serviceId: item.type === 'service' ? item.id : undefined,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    total: item.total,
                  })),
                  subtotal: cartTotal,
                  taxRate: 0,
                  taxAmount: 0,
                  total: cartTotal,
                  status: 'open',
                  orderType: selectedOrderType?.name || 'dine-in',
                  customerName: selectedCustomer?.name,
                  customerPhone: selectedCustomer?.phone,
                  customerEmail: selectedCustomer?.email,
                  tableId: selectedTable?.id,
                  tableName: selectedTable?.name,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                };
                setSelectedOrder(tempOrder);
              }}
            />
          </>
        )}

        {currentView === 'tables' && (
          <div className="flex-1 flex overflow-hidden">
            <POSTableGrid
              tables={tables}
              onTableSelect={handleTableSelected}
              onBack={handleBackToItems}
            />
            <POSCartSidebar
              cart={cart}
              cartTotal={cartTotal}
              onCheckout={() => {}}
              onSaveOrder={handleSaveOrder}
            />
          </div>
        )}

        {currentView === 'customers' && (
          <div className="flex-1 flex overflow-hidden">
            <POSCustomerGrid
              customers={customers}
              onCustomerSelect={handleCustomerSelected}
              onBack={handleBackToItems}
            />
            <POSCartSidebar
              cart={cart}
              cartTotal={cartTotal}
              onCheckout={() => {}}
              onSaveOrder={handleSaveOrder}
            />
          </div>
        )}

        {currentView === 'orders' && (
          <div className="flex-1 flex overflow-hidden">
            <POSOrderGrid
              orders={orders.filter(order => order.status === 'saved')}
              onOrderSelect={handleOrderReopen}
              onPaymentClick={handlePaymentClick}
              onBack={handleBackToItems}
            />
            <POSCartSidebar
              cart={cart}
              cartTotal={cartTotal}
              onCheckout={() => {}}
              onSaveOrder={handleSaveOrder}
            />
          </div>
        )}

        {currentView === 'payment' && selectedOrder && (
          <div className="flex-1 flex overflow-hidden">
            <POSPaymentGrid
              order={selectedOrder}
              paymentTypes={paymentTypes}
              onPaymentProcessed={handlePaymentProcessed}
              onBack={() => setCurrentView('orders')}
            />
            <POSCartSidebar
              cart={cart}
              cartTotal={cartTotal}
              onCheckout={() => {}}
              onSaveOrder={handleSaveOrder}
            />
          </div>
        )}
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
          tenant={tenant}
          receiptTemplates={receiptTemplates}
          printerSettings={printerSettings}
        >
          <Button className="hidden" />
        </ReceiptPrintDialog>
      )}
    </div>
  );
}