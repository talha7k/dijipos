import { Button } from "@/components/ui/button";
import { CheckCircle, Save } from "lucide-react";
import { Order, OrderStatus, OrderPayment } from "@/types";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";

interface OrderActionsProps {
  order: Order;
  payments: OrderPayment[];
  updatingStatus: boolean;
  onMarkAsPaid: (orderId: string) => Promise<void>;
  onCompleteOrder: (orderId: string) => Promise<void>;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderActions({
  order,
  payments,
  updatingStatus,
  onMarkAsPaid,
  onCompleteOrder,
  onUpdateStatus
}: OrderActionsProps) {
  const isOrderFullyPaid = () => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return totalPaid >= order.total;
  };

  return (
    <div className="space-y-4">
      {/* Payment Actions */}
      {!order.paid && isOrderFullyPaid() && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 mb-3">
            Payment Complete:
          </h3>
          <div className="flex gap-2">
            <OrderActionsDialog
              order={order}
              payments={payments}
              updatingStatus={updatingStatus}
              onMarkAsPaid={onMarkAsPaid}
              onUpdateStatus={onUpdateStatus}
            >
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={updatingStatus}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {updatingStatus ? "Marking..." : "Mark as Paid"}
              </Button>
            </OrderActionsDialog>
          </div>
        </div>
      )}

      {/* Order Status Actions */}
      {order.paid &&
        order.status !== OrderStatus.COMPLETED && (
          <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-3">
              Ready to Complete:
            </h3>
            <div className="flex gap-2">
              <OrderActionsDialog
                order={order}
                payments={payments}
                updatingStatus={updatingStatus}
                onMarkAsPaid={onMarkAsPaid}
                onUpdateStatus={onUpdateStatus}
              >
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={updatingStatus}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updatingStatus ? "Completing..." : "Complete Order"}
                </Button>
              </OrderActionsDialog>
            </div>
          </div>
        )}

      {/* General Actions */}
      <div className="p-4 bg-muted border border-border rounded-lg">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Other Actions:
        </h3>
        <div className="flex gap-2 flex-wrap">
          <OrderActionsDialog
            order={order}
            payments={payments}
            updatingStatus={updatingStatus}
            onMarkAsPaid={onMarkAsPaid}
            onUpdateStatus={onUpdateStatus}
          >
            <Button
              size="sm"
              variant="outline"
              disabled={updatingStatus}
            >
              <Save className="h-4 w-4 mr-2" />
              {updatingStatus ? "Saving..." : "Save for Later"}
            </Button>
          </OrderActionsDialog>
        </div>
      </div>
    </div>
  );
}