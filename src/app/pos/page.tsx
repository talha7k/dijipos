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
import { ShoppingCart, ArrowLeft, Package, Wrench } from 'lucide-react';

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

  // Get child categories for a given parent category
  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Get current category ID (last in path)
  const getCurrentCategoryId = () => {
    return categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
  };

  // Get child categories for current category
  const getCurrentChildCategories = () => {
    const currentCategoryId = getCurrentCategoryId();
    return currentCategoryId ? getChildCategories(currentCategoryId) : categories.filter(c => !c.parentId);
  };

  // Filter products and services based on current category
  const currentCategoryId = getCurrentCategoryId();
  const filteredItems = currentCategoryId ? [
    ...products.filter((p: Product) => p.categoryId === currentCategoryId),
    ...services.filter((s: Service) => s.categoryId === currentCategoryId)
  ] : [];

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

  // Calculate cart total
  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + item.total, 0);

  // Navigation handlers
  const navigateToCategory = (categoryId: string) => {
    setCategoryPath([...categoryPath, categoryId]);
  };

  const navigateBack = () => {
    setCategoryPath(categoryPath.slice(0, -1));
  };

  const navigateToRoot = () => {
    setCategoryPath([]);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  // Get items count for a category
  const getItemsCount = (categoryId: string) => {
    const productCount = products.filter(p => p.categoryId === categoryId).length;
    const serviceCount = services.filter(s => s.categoryId === categoryId).length;
    return productCount + serviceCount;
  };

  // Get subcategories count for a category
  const getSubcategoriesCount = (categoryId: string) => {
    return getChildCategories(categoryId).length;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {cart.length} items
            </Badge>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              ${cartTotal.toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Breadcrumb */}
      <div className="bg-card border-b p-4 flex items-center space-x-2">
        {categoryPath.length > 0 ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateToRoot}
              className="flex items-center space-x-1 h-10 px-4"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Categories</span>
            </Button>
            {categoryPath.map((categoryId, index) => (
              <React.Fragment key={categoryId}>
                <span className="text-gray-400 text-lg">/</span>
                {index === categoryPath.length - 1 ? (
                  <span className="font-medium text-lg">{getCategoryName(categoryId)}</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCategoryPath(categoryPath.slice(0, index + 1))}
                    className="flex items-center space-x-1 h-10 px-4"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="font-medium">{getCategoryName(categoryId)}</span>
                  </Button>
                )}
              </React.Fragment>
            ))}
          </>
        ) : (
          <span className="font-medium text-lg">Categories</span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Items Grid */}
        <div className="flex-1 overflow-auto p-4 bg-background">
          {categoryPath.length === 0 ? (
            // Root Categories Grid
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {getCurrentChildCategories().map((category: Category) => {
                const subcategoriesCount = getSubcategoriesCount(category.id);
                const itemsCount = getItemsCount(category.id);
                
                return (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-accent"
                    onClick={() => navigateToCategory(category.id)}
                  >
                    <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                      <CardTitle className="text-xl text-center font-bold text-foreground">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                      <div className="text-center text-muted-foreground text-sm mb-2">
                        {category.description}
                      </div>
                      <div className="flex flex-col gap-1 items-center">
                        {subcategoriesCount > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {subcategoriesCount} subcategories
                          </Badge>
                        )}
                        {itemsCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {itemsCount} items
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Current Level: Subcategories and Items Grid
            <div className="space-y-6">
              {/* Subcategories Section */}
              {getCurrentChildCategories().length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Subcategories</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {getCurrentChildCategories().map((subcategory: Category) => {
                      const itemsCount = getItemsCount(subcategory.id);
                      
                      return (
                        <Card
                          key={subcategory.id}
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-accent"
                          onClick={() => navigateToCategory(subcategory.id)}
                        >
                          <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                            <CardTitle className="text-xl text-center font-bold text-foreground">{subcategory.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                            <div className="text-center text-muted-foreground text-sm mb-2">
                              {subcategory.description}
                            </div>
                            {itemsCount > 0 && (
                              <div className="flex justify-center">
                                <Badge variant="outline" className="text-xs">
                                  {itemsCount} items
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct Items in Current Category */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Items in {getCategoryName(getCurrentCategoryId()!)}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredItems.map((item) => {
                    const isProduct = 'price' in item;
                    const price = isProduct ? item.price : (item as Service).price;
                    
                    return (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-primary/10"
                        onClick={() => addToCart(item, isProduct ? 'product' : 'service')}
                      >
                        <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                          <div className="flex items-center gap-2 mb-2">
                            {isProduct ? (
                              <Package className="h-5 w-5 text-primary" />
                            ) : (
                              <Wrench className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <CardTitle className="text-lg text-center font-bold text-foreground">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                          <div className="text-center text-muted-foreground text-sm mb-3 line-clamp-2">
                            {item.description}
                          </div>
                          <Badge variant="outline" className="text-lg px-4 py-2 font-bold text-primary border-primary">
                            ${price.toFixed(2)}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {filteredItems.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
                    No items found in this category
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="w-80 bg-card border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center space-x-2 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-3 border rounded bg-card">
                    <div>
                      <div className="font-medium text-foreground">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium text-foreground">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t p-4 bg-card">
            <div className="flex justify-between mb-4">
              <span className="font-medium text-lg text-foreground">Total:</span>
              <span className="font-bold text-xl text-foreground">${cartTotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full h-14 text-lg font-bold"
              disabled={cart.length === 0}
            >
              Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}