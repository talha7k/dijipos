import { Button } from "@/components/ui/button";
import { CheckCircle, Save } from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { OrderActionsDialog } from "./OrderStatusActionsDialog";

interface OrderActionsProps {
  order: Order;
  updatingStatus: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderActions({
  order,
  updatingStatus,
  onUpdateStatus
}: OrderActionsProps) {
  const paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;



  return (
    <div className="space-y-4">


      {/* Order Status Actions */}
      {paymentStatus === PaymentStatus.PAID &&
        order.status !== OrderStatus.COMPLETED && (
          <div className="p-4 bg-blue-100 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-3">
              Ready to Complete:
            </h3>
            <div className="flex gap-2">
             <OrderActionsDialog
               order={order}
               updatingStatus={updatingStatus}
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
                 updatingStatus={updatingStatus}
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