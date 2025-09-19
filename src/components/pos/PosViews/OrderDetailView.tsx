import { Order } from "@/types";
import { OrderDetail } from "@/components/pos/OrderDetailView/OrderDetail";

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
  onReopenOrder: (order: Order) => void;
}

export function OrderDetailView({
  order,
  onBack,
  onReopenOrder,
}: OrderDetailViewProps) {
  return (
    <div className="flex-1 flex flex-col bg-background">
      <OrderDetail
        order={order}
        onBack={onBack}
        onReopenOrder={onReopenOrder}
      />
    </div>
  );
}
