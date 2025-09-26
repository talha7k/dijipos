import { Category } from '@/types';
import { Product, Service } from '@/types';
import { CategoryCard } from '@/components/products_services/CategoryCard';

interface POSCategoriesGridProps {
  categories: Category[];
  products: Product[];
  services: Service[];
  categoryPath: string[];
  onCategoryClick: (categoryId: string) => void;
}

export function POSCategoriesGrid({
  categories,
  products,
  services,
  categoryPath,
  onCategoryClick
}: POSCategoriesGridProps) {
  // Get child categories for a given parent category
  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  // Get current category ID (last in path)
  const getCurrentCategoryId = () => {
    return categoryPath.length > 0 ? categoryPath[categoryPath.length - 1] : null;
  };

  // Get current child categories
  const getCurrentChildCategories = () => {
    const currentCategoryId = getCurrentCategoryId();
    return currentCategoryId ? getChildCategories(currentCategoryId) : categories.filter(c => !c.parentId);
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
        return "bg-primary/20 hover:bg-accent-hover border-secondary/50";
      case 1: // First level child
        return "bg-primary/15 hover:bg-accent-hover border-accent/50";
      case 2: // Second level child
        return "bg-primary/10 hover:bg-accent-hover border-primary/30";
      default: // Deeper levels
        return "bg-primary/20 hover:bg-accent-hover border-muted/50";
    }
  };

  const currentCategories = getCurrentChildCategories().sort((a, b) => a.name.localeCompare(b.name));

  // Debug logging
  console.log('POSCategoriesGrid Debug:', {
    categories: categories.length,
    categoryPath,
    currentCategories: currentCategories.length,
    rootCategories: categories.filter(c => !c.parentId).length
  });

  if (currentCategories.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground bg-muted rounded-lg">
        {categoryPath.length === 0 ? 'No categories found' : 'No subcategories found'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {currentCategories.map((category: Category) => (
        <CategoryCard
          key={category.id}
          category={category}
          subcategoriesCount={getSubcategoriesCount(category.id)}
          itemsCount={getItemsCount(category.id)}
          styling={getCategoryStyling(category.id)}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  );
}