import { Order, OrderPayment } from "@/types";
import { OrderDetail } from "@/components/orders/OrderDetail/OrderDetail";

interface OrderDetailViewProps {
  order: Order;
  payments: OrderPayment[];
  onBack: () => void;
  onReopenOrder: (order: Order) => void;
}

export function OrderDetailView({
  order,
  payments,
  onBack,
  onReopenOrder,
}: OrderDetailViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <OrderDetail
        order={order}
        payments={payments}
        onBack={onBack}
        onReopenOrder={onReopenOrder}
      />
    </div>
  );
}
