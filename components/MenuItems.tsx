"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Product, ProductCategory } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function MenuItems() {
  const { productCategories, products, fetchProductCategories, fetchProducts, addToOrder } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProductCategories();
    fetchProducts();
  }, [fetchProductCategories, fetchProducts]);

  const displayedProducts = selectedCategory
    ? products.filter(p => p.category_product.id === selectedCategory)
    : products;

  const handleAddItem = (product: Product) => {
    addToOrder({
      product: product,
      quantity: 1,
      price: product.price,
      special_instructions: '',
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Menu Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {productCategories.map((category: ProductCategory) => (
          <Card key={category.id} className="cursor-pointer" onClick={() => setSelectedCategory(category.id)}>
            <CardContent className="p-0">
              <div className="relative h-40">
                <Image src={category.image || '/placeholder.jpg'} alt={category.name} layout="fill" objectFit="cover" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{category.name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-2xl font-bold mb-4">Menu Items</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product: Product) => (
          <Card key={product.id}>
            <CardContent>
              <div className="relative h-40 mb-2">
                <Image src={product.image || '/placeholder.jpg'} alt={product.name_en} layout="fill" objectFit="cover" />
              </div>
              <div>
                <h3 className="font-semibold">{product.name_en}</h3>
                <p>${product.price.toFixed(2)}</p>
                <Button onClick={() => handleAddItem(product)} className="mt-2">Add to Order</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
