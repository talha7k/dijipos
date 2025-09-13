'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/ui/action-buttons';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Category, Product, Service } from '@/types';

interface CategoryTreeProps {
  categories: Category[];
  products: Product[];
  services: Service[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onCategoryDelete: (categoryId: string) => void;
  type: 'product' | 'service';
  level?: number;
}

export function CategoryTree({
  categories,
  products,
  services,
  selectedCategory,
  onCategorySelect,
  onCategoryDelete,
  type,
  level = 0
}: CategoryTreeProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const getChildCategories = (parentId: string) => {
    return categories.filter(c => c.parentId === parentId);
  };

  const getItemsCount = (categoryId: string) => {
    if (type === 'product' && products.length > 0) {
      return products.filter(p => p.categoryId === categoryId).length;
    }
    if (type === 'service' && services.length > 0) {
      return services.filter(s => s.categoryId === categoryId).length;
    }
    return 0;
  };

  const isExpanded = (categoryId: string) => {
    return expandedCategories.has(categoryId);
  };

  const hasChildren = (categoryId: string) => {
    return getChildCategories(categoryId).length > 0;
  };

  const filteredCategories = categories.filter(c => 
    (c.type === type || c.type === 'both') && 
    (level === 0 ? !c.parentId : c.parentId)
  );

  return (
    <div className="space-y-1">
      {filteredCategories.map(category => {
        const childCategories = getChildCategories(category.id);
        const itemCount = getItemsCount(category.id);
        const isCategoryExpanded = isExpanded(category.id);
        const hasChildCategories = hasChildren(category.id);

        return (
          <div key={category.id}>
            <div className="flex items-center justify-between w-full group">
              <Button
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className={`flex-1 justify-start ${level > 0 ? 'pl-4' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {hasChildCategories && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(category.id);
                      }}
                    >
                      {isCategoryExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                  {!hasChildCategories && <div className="w-3" />}
                  {isCategoryExpanded ? (
                    <FolderOpen className="h-4 w-4" />
                  ) : (
                    <Folder className="h-4 w-4" />
                  )}
                  <span className="truncate">{category.name}</span>
                </div>
                <Badge variant={selectedCategory === category.id ? "default" : "secondary"} className="ml-auto">
                  {itemCount}
                </Badge>
              </Button>
              <ActionButtons
                onDelete={() => onCategoryDelete(category.id)}
                showEdit={false}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            
            {hasChildCategories && isCategoryExpanded && (
              <div className="ml-4">
                <CategoryTree
                  categories={childCategories}
                  products={products}
                  services={services}
                  selectedCategory={selectedCategory}
                  onCategorySelect={onCategorySelect}
                  onCategoryDelete={onCategoryDelete}
                  type={type}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}