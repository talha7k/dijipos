import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Category } from '@/types';

interface POSBreadcrumbProps {
  categoryPath: string[];
  categories: Category[];
  onNavigateToRoot: () => void;
  onNavigateToPath: (path: string[]) => void;
}

export function POSBreadcrumb({
  categoryPath,
  categories,
  onNavigateToRoot,
  onNavigateToPath
}: POSBreadcrumbProps) {
  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'uncategorized') {
      return 'Uncategorized Items';
    }
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <div className="bg-card border-b p-3 flex items-center space-x-2 max-w-full overflow-hidden h-[3.5rem]">
      {categoryPath.length > 0 ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToRoot}
            className="flex items-center space-x-1 h-8 px-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium text-sm">Categories</span>
          </Button>
          {categoryPath.map((categoryId, index) => (
            <React.Fragment key={categoryId}>
              <span className="text-gray-400 text-sm">/</span>
              {index === categoryPath.length - 1 ? (
                <span className="font-medium text-sm">{getCategoryName(categoryId)}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToPath(categoryPath.slice(0, index + 1))}
                  className="flex items-center space-x-1 h-8 px-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium text-sm">{getCategoryName(categoryId)}</span>
                </Button>
              )}
            </React.Fragment>
          ))}
        </>
      ) : (
        <span className="font-medium text-sm">Categories</span>
      )}
    </div>
  );
}