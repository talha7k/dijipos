import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Sofa } from "lucide-react";
import { Table, Order } from "@/types";
import { getTableStatusColor } from "@/lib/utils";

interface POSTableCardProps {
  table: Table;
  tableOrder?: Order;
  isAvailable: boolean;
  onClick: () => void;
}

export function POSTableCard({
  table,
  tableOrder,
  isAvailable,
  onClick,
}: POSTableCardProps) {
  const getStatusColor = (status: string, withBorder = true) => {
    return getTableStatusColor(status, withBorder);
  };

  return (
    <Card 
      className={`group hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20 cursor-pointer ${!isAvailable ? 'opacity-60' : ''}`}
      onClick={isAvailable ? onClick : undefined}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Table Icon */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${getStatusColor(table.status, false).replace("border-", "bg-").replace("border", "bg-opacity-10")}`}
          >
            <Sofa
              className={`h-8 w-8 ${getStatusColor(table.status, false).replace("border-", "text-").replace("border", "text")}`}
            />
          </div>

          {/* Table Info */}
          <div className="space-y-2 w-full">
            <h3 className="font-semibold text-lg truncate">{table.name}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{table.capacity} seats</span>
            </div>

            {/* Status Badge */}
            <Badge
              className={`${getStatusColor(table.status)} w-full justify-center`}
            >
              {table.status}
            </Badge>

            {/* Order Info */}
            {tableOrder && (
              <Badge variant="secondary" className="text-blue-600 bg-blue-50 border-blue-200 text-xs">
                <User className="h-3 w-3 mr-1" />
                {tableOrder.customerName || "Customer"}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}