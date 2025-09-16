import { Table, Order } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Armchair as TableIcon } from 'lucide-react';
import { useTableManagement } from '@/legacy_hooks/tables/use-table-management';

interface TableCardProps {
  table: Table;
  tableOrder?: Order;
  isAvailable: boolean;
  onClick: () => void;
}

export function TableCard({ table, tableOrder, isAvailable, onClick }: TableCardProps) {
  const { getStatusColor } = useTableManagement(undefined);

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