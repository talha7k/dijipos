import { FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types';

interface SubcategoryCardProps {
  subcategory: Category;
  itemsCount: number;
  subcategoriesCount?: number;
  onClick: (subcategoryId: string) => void;
  className?: string;
}

export function SubcategoryCard({
  subcategory,
  itemsCount,
  subcategoriesCount = 0,
  onClick,
  className = ''
}: SubcategoryCardProps) {
  return (
    <div
      className={`border-3 border-blue-500/60 dark:border-blue-400/20 cursor-pointer bg-card rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-48 flex flex-col active:scale-95 hover:bg-accent/50 ${className}`}
      onClick={() => onClick(subcategory.id)}
    >
      <div className="pt-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div
          className="px-3 mb-3 text-lg text-center font-bold text-foreground leading-tight"
          title={subcategory.name}
        >
          {subcategory.name}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-center text-muted-foreground text-xs line-clamp-3 mb-2 px-3">
          {subcategory.description}
        </div>
        <div className="flex flex-col gap-1 items-center mt-auto">
          {subcategoriesCount > 0 && (
            <Badge variant="secondary" className="text-xs w-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {subcategoriesCount} subcategories
            </Badge>
          )}
          {itemsCount > 0 && (
            <Badge variant="outline" className="text-xs w-full border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
              {itemsCount} items
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}