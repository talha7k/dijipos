"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Save,
  Printer,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus, OrderPayment } from "@/types";
import {
  ORDER_STATUS_BUTTON_VARIANTS,
  getOrderStatusColor,
} from "@/types/enums";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { QueueBadge } from "./QueueBadge";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/atoms";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { useSeparatedTemplates } from "@/lib/hooks/useSeparatedTemplates";
import { formatDateTime } from "@/lib/utils";

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
  onReopenOrder?: (order: Order) => void;
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
  onReopenOrder,
  className = "",
}: OrderSummaryCardProps) {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const { storeSettings } = useStoreSettings();
  const { allReceiptTemplates: receiptTemplates = [] } =
    useSeparatedTemplates();
  const printerSettings = storeSettings?.printerSettings;
  const { formatCurrency } = useCurrency();

  // Calculate payment amounts for display, but use order.paymentStatus for status
  const calculatedTotalPaid =
    totalPaid !== undefined
      ? totalPaid
      : payments.reduce((sum, payment) => sum + payment.amount, 0);

  const paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;
  const isActuallyPaid = paymentStatus === PaymentStatus.PAID;

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
            <OrderStatusBadge
              isPaid={isActuallyPaid}
              queueNumber={order.queueNumber}
              showQueueBadge={false}
            />
          </div>
        </div>

        {/* Print and Reopen Order Buttons - Same Row */}
        {(selectedOrganization && storeSettings) || onReopenOrder ? (
          <div className="flex gap-2 mt-2">
            {selectedOrganization && storeSettings && (
              <ReceiptPrintDialog
                order={order}
                organization={selectedOrganization}
                receiptTemplates={receiptTemplates}
                payments={payments}
                printerSettings={printerSettings}
              >
                <Button variant="outline" size="sm" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </ReceiptPrintDialog>
            )}
            {onReopenOrder && (
              <Button
                onClick={() => onReopenOrder(order)}
                variant="outline"
                size="sm"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
              >
                Reopen
              </Button>
            )}
          </div>
        ) : null}

        <div
          onClick={onClick ? () => onClick(order) : undefined}
          className="space-y-2 cursor-pointer"
        >
          <div className="bg-muted/70 rounded-lg py-2 my-4 px-4">
            <div className="flex items-center gap-2 mb-1">
              {order.queueNumber && <QueueBadge queueNumber={order.queueNumber} />}
              <span className="font-bold">
                {formatCurrency(order.total || 0)}
              </span>
            </div>
            {showCreatedDate && (
              <div className="text-xs text-muted-foreground text-center">
                {formatDateTime(order.createdAt)}
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span>Order ID:</span>
            <span>{order.orderNumber}</span>
          </div>

          {totalPaid !== undefined && (
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPaid || 0)}
              </span>
            </div>
          )}

          {remainingAmount !== undefined && (
            <div className="flex justify-between border-t pt-2 ">
              <span className="font-bold">Remaining:</span>
              <span
                className={`font-bold ${
                  remainingAmount > 0
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(remainingAmount || 0)}
              </span>
            </div>
          )}

          {changeDue !== undefined && changeDue > 0 && (
            <div className="flex justify-between">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Change Due:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(changeDue || 0)}
              </span>
            </div>
          )}

          {showOrderDetails && (
            <>
              <div className="flex justify-between text-sm">
                <span>Customer:</span>
                <span>{order.customerName || "Walk-in"}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Table:</span>
                <span>{order.tableName || "N/A"}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Order Type:</span>
                <span className="capitalize">{order.orderType}</span>
              </div>

              {showItemCount && (
                <div className="flex justify-between text-sm">
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
