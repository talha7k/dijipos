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
  isRecursive?: boolean;
}

function CategoryTreeNode({
  category,
  allCategories,
  products,
  services,
  selectedCategory,
  onCategorySelect,
  onCategoryDelete,
  type,
  level,
  expandedCategories,
  toggleExpanded
}: {
  category: Category;
  allCategories: Category[];
  products: Product[];
  services: Service[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onCategoryDelete: (categoryId: string) => void;
  type: 'product' | 'service';
  level: number;
  expandedCategories: Set<string>;
  toggleExpanded: (categoryId: string) => void;
}) {
  const getChildCategories = (parentId: string) => {
    return allCategories.filter(c => c.parentId === parentId);
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

  const isExpanded = expandedCategories.has(category.id);
  const childCategories = getChildCategories(category.id);
  const itemCount = getItemsCount(category.id);
  const hasChildCategories = childCategories.length > 0;

  return (
    <div key={category.id}>
      <div className="flex items-center justify-between w-full group">
        <Button
          variant={selectedCategory === category.id ? "default" : "ghost"}
          size="sm"
          className={`flex-1 justify-start ${level > 0 ? 'pl-4' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onCategorySelect(category.id);
          }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildCategories && (
              <div
                className="h-4 w-4 flex items-center justify-center cursor-pointer hover:bg-accent rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </div>
            )}
            {!hasChildCategories && <div className="w-3" />}
            {isExpanded ? (
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
      
      {hasChildCategories && isExpanded && (
        <div className="ml-4">
          {childCategories.map(childCategory => (
            <CategoryTreeNode
              key={childCategory.id}
              category={childCategory}
              allCategories={allCategories}
              products={products}
              services={services}
              selectedCategory={selectedCategory}
              onCategorySelect={onCategorySelect}
              onCategoryDelete={onCategoryDelete}
              type={type}
              level={level + 1}
              expandedCategories={expandedCategories}
              toggleExpanded={toggleExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({
  categories,
  products,
  services,
  selectedCategory,
  onCategorySelect,
  onCategoryDelete,
  type,
  level = 0,
  isRecursive = false
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

  const filteredCategories = isRecursive 
    ? categories 
    : categories.filter(c => 
        (c.type === type || c.type === 'both') && 
        (level === 0 ? !c.parentId : true)
      );

  return (
    <div className="space-y-1">
      {filteredCategories.map(category => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          allCategories={categories}
          products={products}
          services={services}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          onCategoryDelete={onCategoryDelete}
          type={type}
          level={level}
          expandedCategories={expandedCategories}
          toggleExpanded={toggleExpanded}
        />
      ))}
    </div>
  );
}