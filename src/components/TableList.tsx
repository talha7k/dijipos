'use client';

import { Table as TableType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Users } from 'lucide-react';

interface TableListProps {
  tables: TableType[];
  searchTerm: string;
  onDeleteTable: (tableId: string) => void;
}

export function TableList({
  tables,
  searchTerm,
  onDeleteTable
}: TableListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTables = tables.filter(table => {
    return searchTerm === '' ||
      table.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Tables
          <Badge variant="outline" className="ml-2">
            {filteredTables.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => (
              <Card key={table.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{table.name}</CardTitle>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Capacity: {table.capacity}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTable(table.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p>
              {searchTerm
                ? 'No tables found matching your search.'
                : 'No tables found. Click Add Table to get started.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}