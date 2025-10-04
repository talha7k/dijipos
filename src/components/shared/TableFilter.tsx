'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface Column {
  accessorKey: string;
  header: string;
  filterType?: 'text' | 'select' | 'date';
  filterOptions?: FilterOption[];
}

interface TableFilterProps {
  columns: Column[];
  onFilterChange: (filters: Record<string, string>) => void;
}

export function TableFilter({ columns, onFilterChange }: TableFilterProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (columnId: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnId]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v && v.trim() !== '').length}
            </span>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({})}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-4 border-t">
          {columns.map(column => {
            if (!column.filterType) return null;

            return (
              <div key={column.accessorKey}>
                {column.filterType === 'text' && (
                  <Input
                    placeholder={`${column.header}...`}
                    value={filters[column.accessorKey] || ''}
                    onChange={(e) => handleInputChange(column.accessorKey, e.target.value)}
                    className="w-full"
                  />
                )}
                {column.filterType === 'select' && (
                  <Select onValueChange={(value) => handleInputChange(column.accessorKey, value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`${column.header}...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {column.filterOptions?.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
