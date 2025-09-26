import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { ItemCard } from '../ItemCard';
import { SubcategoryCard } from '../SubcategoryCard';
import { Category, Product, Service } from '@/types';

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
  const currentChildCategories = currentCategoryId ? getChildCategories(currentCategoryId).sort((a, b) => a.name.localeCompare(b.name)) : [];
  
   // Get items for current category
   const filteredItems = (isViewingUncategorized ? [
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
   ]).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
      {/* Subcategories Section */}
      {currentChildCategories.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6">Subcategories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentChildCategories.map((subcategory: Category) => {
              const itemsCount = getItemsCount(subcategory.id);
              const subcategoriesCount = getSubcategoriesCount(subcategory.id);

              return (
                <SubcategoryCard
                  key={subcategory.id}
                  subcategory={subcategory}
                  itemsCount={itemsCount}
                  subcategoriesCount={subcategoriesCount}
                  onClick={onCategoryClick}
                  className={getCategoryStyling(subcategory.id)}
                />
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
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
           {filteredItems.map((item) => (
             <ItemCard
               key={item.id}
               item={item}
               onClick={onItemClick}
             />
           ))}
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