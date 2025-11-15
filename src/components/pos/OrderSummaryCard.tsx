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
  Sofa,
  Package,
  Users,
  FileText,
  CreditCard,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { getOrderStatusColor } from "@/types/enums";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { QueueBadge } from "./QueueBadge";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/atoms";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { useStaticTemplates } from "@/lib/hooks/useStaticTemplates";
import { formatDateTime, truncateTextByType } from "@/lib/utils";

interface OrderSummaryCardProps {
  order: Order;
  showPaymentStatus?: boolean;
  showOrderDetails?: boolean;
  showItemCount?: boolean;
  showCreatedDate?: boolean;
  totalPaid?: number;
  remainingAmount?: number;
  changeDue?: number;
  onOrderSelect?: (order: Order) => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => Promise<void>;

  onReopenOrder?: (order: Order) => void;
  className?: string;
}

export function OrderSummaryCard({
  order,
  showOrderDetails = true,
  showItemCount = false,
  showCreatedDate = false,
  totalPaid,
  remainingAmount,
  changeDue,
  onOrderSelect,
  onStatusChange,
  onReopenOrder,
  className = "",
}: OrderSummaryCardProps) {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const { storeSettings } = useStoreSettings();
  const { receiptTemplates = [] } = useStaticTemplates();
  const printerSettings = storeSettings?.printerSettings;
  const { formatCurrency } = useCurrency();

  const paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;

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
      className={`${onOrderSelect ? " hover:shadow-lg transition-all duration-200" : ""} ${className}`}
    >
      <CardContent className="space-y-4">
        {/* Status and Payment Badges - 3 column grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Order Status Badge - spans 2 columns */}
          <div className="col-span-2">
            <OrderActionsDialog order={order} onUpdateStatus={onStatusChange}>
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
              paymentStatus={paymentStatus}
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
          onClick={onOrderSelect ? () => onOrderSelect(order) : undefined}
          className="space-y-2 cursor-pointer"
        >
          <div className="bg-muted/70 rounded-lg py-2 my-4 px-4">
            {/* Badges Row */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {order.queueNumber && (
                <QueueBadge queueNumber={order.queueNumber} />
              )}
              {showOrderDetails && order.tableName && (
                <Badge
                  variant="outline"
                  className="text-sm flex items-center gap-1 border-2 border-muted justify-center py-1"
                >
                  <Sofa className="h-5 w-5 text-red-800" />
                  {order.tableName}
                </Badge>
              )}
              {showItemCount && (
                <Badge
                  variant="outline"
                  className="text-sm flex items-center gap-1 border-2 border-muted justify-center py-1"
                >
                  <Package className="h-5 w-5 text-green-500" />
                  {order.items.length}
                </Badge>
              )}
            </div>

            {/* Total Price Row */}
            <div className="flex items-center justify-center">
              <span className="font-bold">
                {formatCurrency(order.total || 0)}
              </span>
            </div>

            {showCreatedDate && (
              <div className="text-xs text-muted-foreground text-center mt-1">
                {formatDateTime(order.createdAt)}
              </div>
            )}
          </div>

          {/* Order ID - Full Width */}
          <div className="bg-muted/50 rounded-lg p-2 mb-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div title="Order ID">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
          </div>

          {/* Payment Information */}
          {(totalPaid !== undefined ||
            remainingAmount !== undefined ||
            (changeDue !== undefined && changeDue > 0)) && (
            <div className="bg-muted/50 rounded-lg p-2 mb-2 space-y-1">
              {totalPaid !== undefined && (
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1" title="Total Paid">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalPaid || 0)}
                  </span>
                </div>
              )}

              {remainingAmount !== undefined && (
                <div className="flex justify-between text-sm">
                  <div
                    className="flex items-center gap-1"
                    title="Remaining Amount"
                  >
                    <CreditCard className="h-4 w-4" />
                  </div>
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
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1" title="Change Due">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(changeDue || 0)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Order Details - Separate Sections */}
          {showOrderDetails && (
            <div className="space-y-2">
              {/* Customer Section */}
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div title="Customer">
                    <Users className="h-4 w-4 flex-shrink-0" />
                  </div>
                  <span className="break-words">
                    {truncateTextByType(
                      order.customerName || "Walk-in",
                      "short",
                    )}
                  </span>
                </div>
              </div>

              {/* Order Type Section */}
              <div className="bg-muted/50 rounded-lg p-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div title="Order Type">
                    <Receipt className="h-4 w-4 flex-shrink-0" />
                  </div>
                  <span className="capitalize break-words">
                    {truncateTextByType(order.orderType, "short")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
