'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Service, Category, Table, Customer, Order, OrderPayment, PaymentType } from '@/types';
import { POSHeader } from '@/components/POSHeader';
import { POSBreadcrumb } from '@/components/POSBreadcrumb';
import { POSCategoriesGrid } from '@/components/POSCategoriesGrid';
import { POSItemsGrid } from '@/components/POSItemsGrid';
import { POSCartSidebar } from '@/components/POSCartSidebar';
import { POSTableGrid } from '@/components/POSTableGrid';
import { POSCustomerGrid } from '@/components/POSCustomerGrid';
import { POSOrderGrid } from '@/components/POSOrderGrid';
import { POSPaymentGrid } from '@/components/POSPaymentGrid';

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
      setLoading(false);
    });

    return () => {
      productsUnsubscribe();
      servicesUnsubscribe();
      categoriesUnsubscribe();
      tablesUnsubscribe();
      customersUnsubscribe();
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

  const handleSaveOrder = async () => {
    if (cart.length === 0 || !tenantId) return;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Convert cart items to order items
    const orderItems = cart.map(cartItem => ({
      id: `${cartItem.type}-${cartItem.id}`,
      type: cartItem.type,
      productId: cartItem.type === 'product' ? cartItem.id : undefined,
      serviceId: cartItem.type === 'service' ? cartItem.id : undefined,
      name: cartItem.name,
      quantity: cartItem.quantity,
      unitPrice: cartItem.price,
      total: cartItem.total,
    }));

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
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerEmail: selectedCustomer?.email,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      orderType: 'dine-in', // TODO: Make this configurable
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
              orders={[]} // TODO: Add orders data
              onOrderSelect={() => {}} // TODO: Implement order reopening
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
      </div>
    </div>
  );
}