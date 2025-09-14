'use client';

import { Product, Category } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { Package } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchTerm: string;
  onDeleteProduct: (productId: string) => void;
}

export function ProductList({
  products,
  categories,
  selectedCategory,
  searchTerm,
  onDeleteProduct
}: ProductListProps) {
  const getCategoryPath = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedCategory 
            ? `${categories.find(c => c.id === selectedCategory)?.name || 'Selected'} Products` 
            : 'All Products'
          }
          <Badge variant="outline" className="ml-2">
            {filteredProducts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="outline">${product.price.toFixed(2)}</Badge>
                  </div>
                  {product.categoryId && (
                    <Badge variant="secondary" className="w-fit">
                      {getCategoryPath(product.categoryId)}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description || 'No description available.'}
                  </p>
                  <div className="flex justify-end">
                    <ActionButtons
                      onDelete={() => onDeleteProduct(product.id)}
                      showEdit={false}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4" />
            <p>
              {searchTerm || selectedCategory
                ? 'No products found matching your criteria.'
                : 'No products found. Click Add Product to get started.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}