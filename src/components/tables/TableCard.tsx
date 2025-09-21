import { Table, Order } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, User, Sofa, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getTableStatusColor } from "@/lib/utils";

interface TableCardProps {
  table: Table;
  tableOrder?: Order;
  onDeleteTable?: (id: string) => void;
  deleteTableId?: string | null;
  setDeleteTableId?: (id: string | null) => void;
  confirmDeleteTable?: () => void;
}

export function TableCard({
  table,
  tableOrder,
  onDeleteTable,
  deleteTableId,
  setDeleteTableId,
  confirmDeleteTable,
}: TableCardProps) {
  const getStatusColor = (status: string, withBorder = true) => {
    return getTableStatusColor(status, withBorder);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20 cursor-pointer relative">
      <CardHeader className="pb-2">
        {/* Delete Button (only in settings context) */}
        {onDeleteTable && setDeleteTableId && confirmDeleteTable && (
          <div className="absolute top-2 right-2">
            <AlertDialog
              open={deleteTableId === table.id}
              onOpenChange={(open) => !open && setDeleteTableId(null)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!!tableOrder}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTable(table.id);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete table &ldquo;{table.name}
                    &rdquo;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteTableId(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => confirmDeleteTable()}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6 pt-0">
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
              <div className="flex items-center justify-center gap-2 text-sm">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-blue-600 font-medium truncate">
                  {tableOrder.customerName || "Customer"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}