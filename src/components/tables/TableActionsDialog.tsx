'use client';

import { useState } from 'react';
import { Table, Order, TableStatus } from '@/types';
import { useTablesData } from '@/hooks/tables/useTables';
import { useOrders } from '@/hooks/orders/useOrders';
import { useTableManagement } from '@/hooks/tables/use-table-management';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ArrowRight, RotateCcw } from 'lucide-react';

interface TableActionsDialogProps {
  table: Table;
  children: React.ReactNode;
}

export function TableActionsDialog({ table, children }: TableActionsDialogProps) {
  const organizationId = useOrganizationId();
  const { tables } = useTablesData(organizationId || undefined);
  const { orders } = useOrders(organizationId || undefined);
  const { releaseTable, moveOrderToTable, updating } = useTableManagement(organizationId || undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Find active order for this table
  const tableOrder = orders.find(
    order => order.tableId === table.id && 
    order.status !== 'completed' && 
    order.status !== 'cancelled'
  );

  // Get other available tables for moving orders
  const availableTables = tables.filter(
    t => t.id !== table.id && t.status === TableStatus.AVAILABLE
  );

  const handleReleaseTable = async () => {
    if (!tableOrder) return;
    
    setIsProcessing(true);
    try {
      const success = await releaseTable(table.id, tableOrder);
      if (success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error releasing table:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMoveOrder = async () => {
    if (!tableOrder || !selectedTableId) return;
    
    setIsProcessing(true);
    try {
      const targetTable = tables.find(t => t.id === selectedTableId);
      if (targetTable) {
        const success = await moveOrderToTable(tableOrder, table.id, selectedTableId, targetTable.name);
        if (success) {
          setIsOpen(false);
          setSelectedTableId('');
        }
      }
    } catch (error) {
      console.error('Error moving order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Table Actions - {table.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Table Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              <Badge className={getStatusColor(table.status)}>
                {table.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Capacity: {table.capacity}</span>
            </div>
          </div>

          {/* Order Information */}
          {tableOrder && (
            <div className="space-y-2">
              <h4 className="font-medium">Active Order</h4>
              <Alert>
                <AlertDescription>
                  <div className="space-y-1">
                    <div><strong>Order:</strong> {tableOrder.orderNumber}</div>
                    <div><strong>Customer:</strong> {tableOrder.customerName || 'Walk-in'}</div>
                    <div><strong>Total:</strong> ${tableOrder.total.toFixed(2)}</div>
                    <div><strong>Status:</strong> {tableOrder.status}</div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Release Table Action */}
            {tableOrder && (
              <div className="space-y-2">
                <h4 className="font-medium">Release Table</h4>
                <p className="text-sm text-muted-foreground">
                  Mark this table as available. The order will remain active but won&apos;t be assigned to any table.
                </p>
                <Button 
                  onClick={handleReleaseTable}
                  disabled={isProcessing}
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Releasing...' : 'Release Table'}
                </Button>
              </div>
            )}

            {/* Move Order Action */}
            {tableOrder && availableTables.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Move Order to Another Table</h4>
                <p className="text-sm text-muted-foreground">
                  Assign this order to a different available table.
                </p>
                <div className="flex items-center gap-2">
                  <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select target table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map((targetTable) => (
                        <SelectItem key={targetTable.id} value={targetTable.id}>
                          {targetTable.name} (Capacity: {targetTable.capacity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <Button 
                  onClick={handleMoveOrder}
                  disabled={!selectedTableId || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Moving...' : 'Move Order'}
                </Button>
              </div>
            )}

            {/* No Actions Available */}
            {!tableOrder && (
              <Alert>
                <AlertDescription>
                  This table is currently not assigned to any active order. No actions available.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}