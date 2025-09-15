
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  CheckCircle,
  CreditCard,
  Clock,
  XCircle,
  Save,
  Printer,
} from "lucide-react";
import { Order, OrderStatus, OrderPayment } from "@/types";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";
import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePrinterSettingsData } from "@/hooks/organization/use-printer-settings-data";
import { useReceiptTemplatesData } from "@/hooks/use-receipt-templates-data";

interface OrderSummaryCardProps {
  order: Order;
  payments?: OrderPayment[];
  showPaymentStatus?: boolean;
  showOrderDetails?: boolean;
  showItemCount?: boolean;
  showCreatedDate?: boolean;
  totalPaid?: number;
  remainingAmount?: number;
  changeDue?: number;
  onClick?: (order: Order) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onMarkAsPaid?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  className?: string;
}

export function OrderSummaryCard({
  order,
  payments = [],
  showOrderDetails = true,
  showItemCount = false,
  showCreatedDate = false,
  totalPaid,
  remainingAmount,
  changeDue,
  onClick,
  onStatusChange,
  onMarkAsPaid,
  onCompleteOrder,
  className = "",
}: OrderSummaryCardProps) {
  const { currentOrganization } = useAuth();
  const { printerSettings } = usePrinterSettingsData(currentOrganization?.id || undefined);
  const { receiptTemplates = [] } = useReceiptTemplatesData(currentOrganization?.id || '');

  // Calculate payment amounts for display, but use order.paid for status
  const calculatedTotalPaid =
    totalPaid !== undefined
      ? totalPaid
      : payments.reduce((sum, payment) => sum + payment.amount, 0);
  const calculatedRemainingAmount =
    remainingAmount !== undefined
      ? remainingAmount
      : order.total - calculatedTotalPaid;
  const isActuallyPaid = order.paid;
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "preparing":
        return "bg-blue-500";
      case "open":
        return "bg-yellow-500";
      case "saved":
      case "on_hold":
        return "bg-blue-500";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "preparing":
        return <Receipt className="h-3 w-3" />;
      case "open":
        return <Clock className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      case "saved":
      case "on_hold":
        return <Save className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card
      className={`${
        onClick
          ? " hover:shadow-lg transition-all duration-200"
          : ""
      } ${className}`}
    >
      <CardContent className="space-y-4">
        {/* Status and Payment Badges - 3 column grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Order Status Badge - spans 2 columns */}
          <div className="col-span-2">
            <OrderActionsDialog
              order={order}
              payments={payments}
              onMarkAsPaid={onMarkAsPaid}
              onCompleteOrder={onCompleteOrder}
              onUpdateStatus={onStatusChange}
            >
              <Badge
                className={`${getStatusColor(
                  order.status
                )} text-white w-full justify-center py-2 cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize font-medium">
                  {order.status.replace("_", " ")}
                </span>
              </Badge>
            </OrderActionsDialog>
          </div>

          {/* Payment Status Badge - 1 column */}
          <div>
            <Badge
              className={`${
                isActuallyPaid ? "bg-emerald-500" : "bg-destructive"
              } text-white w-full justify-center py-2`}
            >
              {isActuallyPaid ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <CreditCard className="h-3 w-3 mr-1" />
                  Unpaid
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Print Button */}
        {currentOrganization && (
          <div className="flex justify-center mt-2">
            <ReceiptPrintDialog
              order={order}
              organization={currentOrganization}
              receiptTemplates={receiptTemplates}
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </ReceiptPrintDialog>
          </div>
        )}

        <div onClick={onClick ? () => onClick(order) : undefined}className="space-y-2 cursor-pointer">
          <div className="flex-row justify-center text-center items-center bg-muted/70 rounded-lg py-2 my-4">
            <span className="text-center">Order Number:</span>
            <br />
            <span className="font-bold">{order.orderNumber}</span>
          </div>

           <div className="flex justify-between">
             <span>Order Total:</span>
             <span className="font-bold">${(order.total || 0).toFixed(2)}</span>
           </div>

          {totalPaid !== undefined && (
            <div className="flex justify-between">
              <span>Total Paid:</span>
               <span className="font-bold text-emerald-600 dark:text-emerald-400">
                 ${(totalPaid || 0).toFixed(2)}
               </span>
            </div>
          )}

          {remainingAmount !== undefined && (
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Remaining:</span>
               <span
                 className={`font-bold ${
                   remainingAmount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                 }`}
               >
                 ${(remainingAmount || 0).toFixed(2)}
               </span>
            </div>
          )}

          {changeDue !== undefined && changeDue > 0 && (
            <div className="flex justify-between">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Change Due:</span>
               <span className="font-bold text-emerald-600 dark:text-emerald-400">
                 ${(changeDue || 0).toFixed(2)}
               </span>
            </div>
          )}

          {showOrderDetails && (
            <>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{order.customerName || "Walk-in"}</span>
              </div>

              <div className="flex justify-between">
                <span>Table:</span>
                <span>{order.tableName || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="capitalize">{order.orderType}</span>
              </div>

              {showCreatedDate && (
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{order.createdAt.toLocaleString()}</span>
                </div>
              )}

              {showItemCount && (
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{order.items.length}</span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}