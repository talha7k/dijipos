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

  // Check if we're viewing uncategorized items
  const isViewingUncategorized = categoryPath.length === 1 && categoryPath[0] === 'uncategorized';

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

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  // Get hierarchy level for styling
  const getCategoryHierarchyLevel = (categoryId: string) => {
    let level = 0;
    let currentId = categoryId;
    
    while (currentId) {
      const category = categories.find(c => c.id === currentId);
      if (!category || !category.parentId) break;
      currentId = category.parentId;
      level++;
    }
    
    return level;
  };

  // Get styling based on hierarchy level
  const getCategoryStyling = (categoryId: string) => {
    const level = getCategoryHierarchyLevel(categoryId);
    
    switch (level) {
      case 0: // Root level
        return "bg-secondary/50 hover:bg-secondary/70 border-secondary/50";
      case 1: // First level child
        return "bg-accent/30 hover:bg-accent/50 border-accent/50";
      case 2: // Second level child
        return "bg-secondary/10 hover:bg-secondary/20 border-primary/30";
      default: // Deeper levels
        return "bg-secondary/50 hover:bg-secondary/70 border-muted/50";
    }
  };

  const currentCategoryId = getCurrentCategoryId();
  const currentChildCategories = currentCategoryId ? getChildCategories(currentCategoryId) : [];
  
  // Get items for current category
  const filteredItems = isViewingUncategorized ? [
    // Show uncategorized items
    ...products.filter((p: Product) => !p.categoryId),
    ...services.filter((s: Service) => !s.categoryId)
  ] : currentCategoryId ? [
    // Show items in specific category
    ...products.filter((p: Product) => p.categoryId === currentCategoryId),
    ...services.filter((s: Service) => s.categoryId === currentCategoryId)
  ] : [
    // At root level, show items that don't have a category assigned
    ...products.filter((p: Product) => !p.categoryId),
    ...services.filter((s: Service) => !s.categoryId)
  ];

  return (
    <div className="space-y-8">
      {/* Subcategories Section */}
      {currentChildCategories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6">Subcategories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {currentChildCategories.map((subcategory: Category) => {
              const itemsCount = getItemsCount(subcategory.id);
              const subcategoriesCount = getSubcategoriesCount(subcategory.id);

              return (
                <Card
                  key={subcategory.id}
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 ${getCategoryStyling(subcategory.id)}`}
                  onClick={() => onCategoryClick(subcategory.id)}
                >
                  <CardHeader className="pb-2 flex-1 flex items-center justify-center">
                    <CardTitle className="text-xl text-center font-bold text-foreground">{subcategory.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="text-center text-muted-foreground text-sm mb-2 line-clamp-2">
                      {subcategory.description}
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
        </div>
      )}

      {/* Direct Items in Current Category */}
      <div>
        {(filteredItems.length > 0 || currentCategoryId || isViewingUncategorized || (!currentCategoryId && !isViewingUncategorized)) && (
          <h3 className="text-xl font-semibold mb-6">
            {isViewingUncategorized ? 'Uncategorized Items' : 
             currentCategoryId ? `Items in ${getCategoryName(currentCategoryId!)}` : 'Uncategorized Items'}
          </h3>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {filteredItems.map((item) => {
            const isProduct = 'price' in item;
            const price = isProduct ? item.price : (item as Service).price;

            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 bg-background hover:bg-accent/50"
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
                <CardContent className="flex-1 flex flex-col relative p-0">
                  <div className="text-center text-muted-foreground text-sm line-clamp-3 flex-1 flex items-center px-4 pt-4">
                    {item.description}
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2 font-bold text-primary border-primary w-full text-center absolute bottom-0 left-0 right-0 rounded-none rounded-b-md border-t-0 border-l-0 border-r-0">
                    {price.toFixed(2)}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredItems.length === 0 && currentCategoryId && !isViewingUncategorized && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
            No items found in this category
          </div>
        )}
        
        {isViewingUncategorized && filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
            No uncategorized items found
          </div>
        )}
        
        {!currentCategoryId && !isViewingUncategorized && filteredItems.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
            No uncategorized items found
          </div>
        )}
      </div>
    </div>
  );
}