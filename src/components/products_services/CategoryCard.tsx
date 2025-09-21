import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  subcategoriesCount: number;
  itemsCount: number;
  styling: string;
  onClick: (categoryId: string) => void;
  className?: string;
}

export function CategoryCard({ 
  category, 
  subcategoriesCount, 
  itemsCount, 
  styling, 
  onClick, 
  className = '' 
}: CategoryCardProps) {
  return (
    <div
      className={`border-3 border-primary/60 dark:border-primary/20 cursor-pointer bg-card rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-36 flex flex-col active:scale-95 ${styling} ${className}`}
      onClick={() => onClick(category.id)}
    >
      <div className="pt-4">
        <div 
          className="px-3 mb-3 text-lg text-center font-bold text-foreground leading-tight" 
          title={category.name}
        >
          {category.name}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-center text-muted-foreground text-xs line-clamp-2 mb-2 px-3">
          {category.description}
        </div>
        <div className="flex flex-col gap-1 items-center mt-auto">
          {subcategoriesCount > 0 && (
            <Badge variant="secondary" className="text-xs w-full">
              {subcategoriesCount} subcategories
            </Badge>
          )}
          {itemsCount > 0 && (
            <Badge variant="outline" className="text-xs w-full">
              {itemsCount} items
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}