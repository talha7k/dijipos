"use client"

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ProductCategory, Product } from '@/lib/types';

export default function MenuItems() {
  const { categories, products, addToOrder } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const productCategories = categories.filter(c => c.type === 'product');
  const displayedProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : [];

  const handleAddItem = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToOrder({ product_id: productId, quantity: 1, price: product.price });
    }
  };

  return (
    <div>
      {!selectedCategory ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      ) : (
        <>
          <Button onClick={() => setSelectedCategory(null)} className="mb-4">Back to Categories</Button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedProducts.map((product: Product) => (
              <Card key={product.id}>
                <CardContent className="p-0">
                  <div className="relative h-40">
                    <Image src={product.image || '/placeholder.jpg'} alt={product.name_en} layout="fill" objectFit="cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.name_en}</h3>
                    <p>${product.price.toFixed(2)}</p>
                    <Button onClick={() => handleAddItem(product.id)} className="mt-2">Add to Order</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}