'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { collection, query, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Service, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Wrench, ArrowLeft, ShoppingCart } from 'lucide-react';
import { POSHeader } from '@/components/POSHeader';
import { POSBreadcrumb } from '@/components/POSBreadcrumb';
import { POSCategoriesGrid } from '@/components/POSCategoriesGrid';
import { POSItemsGrid } from '@/components/POSItemsGrid';
import { POSCartSidebar } from '@/components/POSCartSidebar';

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
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categoryPath, setCategoryPath] = useState<string[]>([]);

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
      setLoading(false);
    });

    return () => {
      productsUnsubscribe();
      servicesUnsubscribe();
      categoriesUnsubscribe();
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      <POSHeader cart={cart} cartTotal={cartTotal} />

      <POSBreadcrumb
        categoryPath={categoryPath}
        categories={categories}
        onNavigateToRoot={navigateToRoot}
        onNavigateToPath={setCategoryPath}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
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
      </div>
    </div>
  );
}