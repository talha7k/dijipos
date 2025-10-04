"use client";

import { Product, Category, ProductTransactionType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { Badge } from "@/components/ui/badge";
import { ActionButtons } from "@/components/ui/action-buttons";
import { Package, Layers } from "lucide-react";

interface ProductListProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchTerm: string;
  selectedTransactionType: ProductTransactionType | null;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function ProductList({
  products,
  categories,
  selectedCategory,
  searchTerm,
  selectedTransactionType,
  onEditProduct,
  onDeleteProduct,
}: ProductListProps) {
  const { formatCurrency } = useCurrency();

  const getCategoryPath = (categoryId: string): string => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return "";

    if (category.parentId) {
      const parentPath = getCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }

    return category.name;
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchTerm === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      !selectedCategory || product.categoryId === selectedCategory;

    const matchesTransactionType =
      !selectedTransactionType ||
      product.transactionType === selectedTransactionType;

    return matchesSearch && matchesCategory && matchesTransactionType;
  });

  return (
    <div>
      {selectedCategory && (
        <div className="mb-4 p-3 bg-muted/50 rounded-md">
          <h3 className="text-lg font-medium">
            {categories.find((c) => c.id === selectedCategory)?.name || "Selected"} Category
          </h3>
          <p className="text-sm text-muted-foreground">
            Showing products in this category
          </p>
        </div>
      )}
      <div className="mt-3">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden py-2 pt-4">
                <CardHeader className="pb-0">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm">{product.name}</CardTitle>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    {product.categoryId && (
                      <Badge variant="secondary" className="w-fit ">
                        {getCategoryPath(product.categoryId)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {formatCurrency(product.price)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-4">
                  <p className="text-sm text-muted-foreground mb-1 line-clamp-2">
                    {product.description || "No description available."}
                  </p>

                  {/* Variations Section */}
                  {product.variations && product.variations.length > 0 && (
                    <div className="mb-2 p-2 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Variations ({product.variations.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {product.variations.slice(0, 3).map((variation) => (
                          <div
                            key={variation.id}
                            className="flex justify-between items-center text-xs"
                          >
                            <span className="text-muted-foreground">{variation.name}</span>
                            <span className="font-medium">{formatCurrency(variation.price)}</span>
                          </div>
                        ))}
                        {product.variations.length > 3 && (
                          <div className="text-xs text-muted-foreground italic">
                            +{product.variations.length - 3} more variations
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <ActionButtons
                      onEdit={() => onEditProduct(product)}
                      onDelete={() => onDeleteProduct(product.id)}
                      showEdit={true}
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
                ? "No products found matching your criteria."
                : "No products found. Click Add Product to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
