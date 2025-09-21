'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TableFilter({ columns, onFilterChange }) {
  const [filters, setFilters] = useState({});

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (columnId, value) => {
    setFilters(prev => ({ ...prev, [columnId]: value }));
  };

  return (
    <div className="flex items-center py-4">
      {columns.map(column => {
        if (!column.filterType) return null;

        return (
          <div key={column.accessorKey} className="px-2">
            {column.filterType === 'text' && (
              <Input
                placeholder={`Filter ${column.header}...`}
                value={filters[column.accessorKey] || ''}
                onChange={(e) => handleInputChange(column.accessorKey, e.target.value)}
                className="max-w-sm"
              />
            )}
            {column.filterType === 'select' && (
              <Select onValueChange={(value) => handleInputChange(column.accessorKey, value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`Filter ${column.header}...`} />
                </SelectTrigger>
                <SelectContent>
                  {column.filterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}
    </div>
  );
}
