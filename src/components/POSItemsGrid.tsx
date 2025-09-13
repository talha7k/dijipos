import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category, Product, Service } from '@/types';
import { Package, Wrench } from 'lucide-react';

interface POSItemsGridProps {
  categories: Category[];
  products: Product[];
  services: Service[];
  categoryPath: string[];
  onCategoryClick: (categoryId: string) => void;
  onItemClick: (item: Product | Service, type: 'product' | 'service') => void;
}

export function POSItemsGrid({
  categories,
  products,
  services,
  categoryPath,
  onCategoryClick,
  onItemClick
}: POSItemsGridProps) {
  // Get child categories for a given parent category
  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Get current category ID (last in path)
  const getCurrentCategoryId = () => {
    return categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
  };

  // Get items count for a category
  const getItemsCount = (categoryId: string) => {
    const productCount = products.filter(p => p.categoryId === categoryId).length;
    const serviceCount = services.filter(s => s.categoryId === categoryId).length;
    return productCount + serviceCount;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const currentCategoryId = getCurrentCategoryId();
  const currentChildCategories = currentCategoryId ? getChildCategories(currentCategoryId) : [];
  
  // Get items for current category - include items that don't have a category assigned
  const filteredItems = currentCategoryId ? [
    ...products.filter((p: Product) => p.categoryId === currentCategoryId || !p.categoryId),
    ...services.filter((s: Service) => s.categoryId === currentCategoryId || !s.categoryId)
  ] : [];

  return (
    <div className="space-y-8">
      {/* Subcategories Section */}
      {currentChildCategories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6">Subcategories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {currentChildCategories.map((subcategory: Category) => {
              const itemsCount = getItemsCount(subcategory.id);

              return (
                <Card
                  key={subcategory.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-accent"
                  onClick={() => onCategoryClick(subcategory.id)}
                >
                  <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                    <CardTitle className="text-xl text-center font-bold text-foreground">{subcategory.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center text-muted-foreground text-sm mb-2 line-clamp-2">
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
        <h3 className="text-xl font-semibold mb-6">
          Items in {getCategoryName(currentCategoryId!)}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredItems.map((item) => {
            const isProduct = 'price' in item;
            const price = isProduct ? item.price : (item as Service).price;

            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-primary/10"
                onClick={() => onItemClick(item, isProduct ? 'product' : 'service')}
              >
                <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    {isProduct ? (
                      <Package className="h-5 w-5 text-primary" />
                    ) : (
                      <Wrench className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-lg text-center font-bold text-foreground" title={item.name}>
                    {item.name}
                  </CardTitle>
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
  );
}