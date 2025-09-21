import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Sofa } from "lucide-react";
import { Table, Order } from "@/types";
import { getTableStatusColor } from "@/lib/utils";
import { QueueBadge } from "./QueueBadge";

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
      className={`group hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20 cursor-pointer ${!isAvailable ? "opacity-60" : ""}`}
      onClick={isAvailable ? onClick : undefined}
    >
      <CardContent className="px-4 py-1">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Table Icon with Status Dot */}
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${getStatusColor(table.status, false).replace("border-", "bg-").replace("border", "bg-opacity-10")}`}
            >
              <Sofa
                className={`h-8 w-8 ${getStatusColor(table.status, false).replace("border-", "text-").replace("border", "text")}`}
              />
            </div>
            {/* Status Dot */}
            <div
              className={`absolute -top-0 -right-0 w-4 h-4 rounded-full border-2 border-white ${
                tableOrder ? "bg-red-500" : "bg-green-500"
              }`}
            />
          </div>

          {/* Table Info */}
          <div className="space-y-2 w-full">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-2">
                {table.capacity}
              </span>
              <h3 className="font-semibold text-lg truncate">{table.name}</h3>
            </div>

            {/* Queue Badge and Order Total Row - Below Table Name */}
            {tableOrder && (
              <div className="flex items-center justify-center gap-2 w-full">
                {tableOrder.queueNumber && (
                  <QueueBadge
                    queueNumber={tableOrder.queueNumber}
                    className="text-xs"
                  />
                )}
                <div className="bg-green-500 text-white font-bold text-sm py-1 px-2 rounded flex-1 text-center">
                  ${tableOrder.total?.toFixed(2) || "0.00"}
                </div>
              </div>
            )}

            {/* Order Info / Available Status */}
            {tableOrder ? (
              <Badge
                variant="secondary"
                className="text-blue-600 py-1 mt-4 w-full bg-blue-50 border-blue-200 text-xs max-w-full whitespace-normal break-words flex items-start justify-start gap-1"
              >
                <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">
                  {tableOrder.customerName || "Customer"}
                </span>
              </Badge>
            ) : (
              <div className="text-center py-2 mt-4">
                <span className="text-green-600 font-semibold text-sm border-2 border-green-600 px-2 py-1 rounded">
                  AVAILABLE
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
