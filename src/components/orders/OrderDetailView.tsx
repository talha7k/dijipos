import { Order, OrderPayment, OrderStatus } from "@/types";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrderActions } from "@/components/orders/OrderActions";

interface OrderDetailViewProps {
  order: Order;
  payments: OrderPayment[];
  updatingStatus: boolean;
  onBack: () => void;
  onReopenOrder: (order: Order) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderDetailView({
  order,
  payments,
  updatingStatus,
  onBack,
  onReopenOrder,
  onUpdateStatus,
}: OrderDetailViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <OrderDetail
        order={order}
        payments={payments}
        onBack={onBack}
        onReopenOrder={onReopenOrder}
      />
      <div className="flex-shrink-0 p-4 border-t bg-background">
        <OrderActions
          order={order}
          updatingStatus={updatingStatus}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </div>
  );
}