import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';
import { Product, Service } from '@/types';

interface POSCategoriesGridProps {
  categories: Category[];
  products: Product[];
  services: Service[];
  onCategoryClick: (categoryId: string) => void;
}

export function POSCategoriesGrid({
  categories,
  products,
  services,
  onCategoryClick
}: POSCategoriesGridProps) {
  // Get child categories for a given parent category
  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
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

  // Get root categories (no parent)
  const rootCategories = categories.filter(c => !c.parentId);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {rootCategories.map((category: Category) => {
        const subcategoriesCount = getSubcategoriesCount(category.id);
        const itemsCount = getItemsCount(category.id);

        return (
          <Card
            key={category.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 active:bg-accent"
            onClick={() => onCategoryClick(category.id)}
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
  );
}