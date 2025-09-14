'use client';

import { Table, TableStatus, Order } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft, User, Armchair as TableIcon } from 'lucide-react';

interface POSTableGridProps {
  tables: Table[];
  orders: Order[];
  onTableSelect: (table: Table) => void;
  onBack: () => void;
}

export function POSTableGrid({ tables, orders, onTableSelect, onBack }: POSTableGridProps) {
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

  const availableTables = tables; // Show all tables regardless of status

  // Find orders for occupied tables
  const getTableOrder = (tableId: string) => {
    return orders.find(order => order.tableId === tableId && order.status !== 'completed' && order.status !== 'cancelled');
  };

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
            {availableTables.length} tables
          </Badge>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="flex-1 overflow-auto p-6 bg-background">
        {availableTables.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {availableTables.map((table) => {
              const tableOrder = getTableOrder(table.id);
              const isAvailable = table.status === TableStatus.AVAILABLE;
              
              return (
                <Card 
                  key={table.id} 
                  className={`${isAvailable ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95' : 'opacity-75'} ${tableOrder ? 'border-blue-200' : ''}`}
                  onClick={() => isAvailable && onTableSelect(table)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <TableIcon className="h-5 w-5" />
                      <span>{table.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <Badge className={`${getStatusColor(table.status)} w-full justify-center`}>
                        {table.status}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {table.capacity}
                        </span>
                      </div>
                      {tableOrder && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            {tableOrder.customerName || 'Customer'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg">
              No tables found
            </p>
            <p className="text-sm mt-2">
              Please create tables in Settings → Tables tab first.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}