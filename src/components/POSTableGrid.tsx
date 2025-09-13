'use client';

import { Table } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';

interface POSTableGridProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
  onBack: () => void;
}

export function POSTableGrid({ tables, onTableSelect, onBack }: POSTableGridProps) {
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

  const availableTables = tables.filter(table => table.status === 'available');

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="bg-card shadow p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Select Table</h1>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {availableTables.length} available
          </Badge>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-auto p-6 bg-background">
        {availableTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {availableTables.map((table) => (
              <Card 
                key={table.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                onClick={() => onTableSelect(table)}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{table.name}</CardTitle>
                    <Badge className={getStatusColor(table.status)}>
                      {table.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Capacity: {table.capacity}
                    </span>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTableSelect(table);
                    }}
                  >
                    Select Table
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">
              No available tables
            </p>
            <p className="text-sm mt-2">
              All tables are currently occupied, reserved, or under maintenance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}