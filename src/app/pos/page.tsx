'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Service, Category, Table, Customer } from '@/types';
import { POSHeader } from '@/components/POSHeader';
import { POSBreadcrumb } from '@/components/POSBreadcrumb';
import { POSCategoriesGrid } from '@/components/POSCategoriesGrid';
import { POSItemsGrid } from '@/components/POSItemsGrid';
import { POSCartSidebar } from '@/components/POSCartSidebar';
import { POSTableGrid } from '@/components/POSTableGrid';
import { POSCustomerGrid } from '@/components/POSCustomerGrid';

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
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentView, setCurrentView] = useState<'items' | 'tables' | 'customers'>('items');

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
    setCategoryPath([...categoryPath, categoryId]);
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
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {currentView === 'items' && (
          <>
            <POSBreadcrumb
              categoryPath={categoryPath}
              categories={categories}
              onNavigateToRoot={navigateToRoot}
              onNavigateToPath={setCategoryPath}
            />

            {/* Items Grid */}
            <div className="flex-1 overflow-auto p-4 bg-background">
              {categoryPath.length === 0 ? (
                <POSCategoriesGrid
                  categories={categories}
                  products={products}
                  services={services}
                  onCategoryClick={navigateToCategory}
                />
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
            />
          </div>
        )}
      </div>
    </div>
  );
}