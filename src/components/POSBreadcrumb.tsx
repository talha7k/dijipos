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
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  return (
    <div className="bg-card border-b p-4 flex items-center space-x-2">
      {categoryPath.length > 0 ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToRoot}
            className="flex items-center space-x-1 h-10 px-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Categories</span>
          </Button>
          {categoryPath.map((categoryId, index) => (
            <React.Fragment key={categoryId}>
              <span className="text-gray-400 text-lg">/</span>
              {index === categoryPath.length - 1 ? (
                <span className="font-medium text-lg">{getCategoryName(categoryId)}</span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToPath(categoryPath.slice(0, index + 1))}
                  className="flex items-center space-x-1 h-10 px-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">{getCategoryName(categoryId)}</span>
                </Button>
              )}
            </React.Fragment>
          ))}
        </>
      ) : (
        <span className="font-medium text-lg">Categories</span>
      )}
    </div>
  );
}