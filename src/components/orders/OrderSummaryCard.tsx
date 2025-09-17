"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_BUTTON_VARIANTS,
  getOrderStatusColor,
} from "@/types/enums";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";
import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/atoms";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { usePrinterSettings } from "@/lib/hooks/usePrinterSettings";

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
  onStatusChange?: (orderId: string, status: OrderStatus) => Promise<void>;
  onMarkAsPaid?: (orderId: string) => Promise<void>;
  onCompleteOrder?: (orderId: string) => Promise<void>;
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
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const { storeSettings } = useStoreSettings();
  const { receiptTemplates = [] } = useTemplates();
  const { printerSettings } = usePrinterSettings();

  // Calculate payment amounts for display, but use order.paid for status
  const calculatedTotalPaid =
    totalPaid !== undefined
      ? totalPaid
      : payments.reduce((sum, payment) => sum + payment.amount, 0);

  const isActuallyPaid = order.paid;

  // Get color for UI indicators using the new status color system
  const statusColor = getOrderStatusColor(order.status as OrderStatus);
  const statusButtonVariant =
    ORDER_STATUS_BUTTON_VARIANTS[order.status as OrderStatus] || "secondary";

  // Get background color class for badges
  const getStatusBgColor = (status: OrderStatus) => {
    const color = getOrderStatusColor(status);
    switch (color) {
      case "yellow":
        return "bg-yellow-500";
      case "orange":
        return "bg-orange-500";
      case "green":
        return "bg-green-500";
      case "red":
        return "bg-red-500";
      case "gray":
        return "bg-gray-500";
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
        onClick ? " hover:shadow-lg transition-all duration-200" : ""
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
              onUpdateStatus={onStatusChange}
            >
              <Badge
                className={`${getStatusBgColor(
                  order.status as OrderStatus,
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
        {selectedOrganization && storeSettings && (
          <div className="flex justify-center mt-2">
            <ReceiptPrintDialog
              order={order}
              organization={selectedOrganization}
              receiptTemplates={receiptTemplates}
              payments={payments}
              printerSettings={printerSettings}
            >
              <Button variant="outline" size="sm" className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </ReceiptPrintDialog>
          </div>
        )}

        <div
          onClick={onClick ? () => onClick(order) : undefined}
          className="space-y-2 cursor-pointer"
        >
          <div className="flex-row justify-center text-center items-center bg-muted/70 rounded-lg py-2 my-4">
            {order.queueNumber && (
              <div className="text-sm font-semibold text-primary mb-1">
                Queue #: {order.queueNumber}
              </div>
            )}
            <span className="font-bold">{order.orderNumber}</span>
            <br />
            {showCreatedDate && (
              <span className="text-xs text-muted-foreground">
                {order.createdAt.toLocaleString()}
              </span>
            )}
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
                  remainingAmount > 0
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                ${(remainingAmount || 0).toFixed(2)}
              </span>
            </div>
          )}

          {changeDue !== undefined && changeDue > 0 && (
            <div className="flex justify-between">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Change Due:
              </span>
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
