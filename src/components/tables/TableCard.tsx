import { Table, Order } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Armchair as TableIcon } from 'lucide-react';
// Utility function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'occupied':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'reserved':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

interface TableCardProps {
  table: Table;
  tableOrder?: Order;
  isAvailable: boolean;
  onClick: () => void;
}

export function TableCard({ table, tableOrder, isAvailable, onClick }: TableCardProps) {

  return (
    <Card 
      key={table.id} 
      className={`${isAvailable ? 'cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95' : 'opacity-75'} ${tableOrder ? 'border-blue-200' : ''}`}
      onClick={onClick}
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
}