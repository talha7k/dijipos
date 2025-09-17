'use client';

import { Table, Order } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeft } from 'lucide-react';
// Utility function
const isAvailable = (status: string) => status === 'available';
import { TableCard } from '@/components/tables/TableCard';

interface POSTableGridProps {
  tables: Table[];
  orders: Order[];
  onTableSelect: (table: Table) => void;
  onBack: () => void;
}

export function POSTableGrid({ tables, orders, onTableSelect, onBack }: POSTableGridProps) {

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
              const tableIsAvailable = isAvailable(table.status);
              
              return (
                <TableCard
                  key={table.id}
                  table={table}
                  tableOrder={tableOrder}
                  isAvailable={tableIsAvailable}
                  onClick={() => tableIsAvailable && onTableSelect(table)}
                />
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