import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Order, OrderPayment } from "@/types";
import { OrderSummaryCard } from "@/components/orders/OrderSummaryCard";
import { PaymentList } from "@/components/orders/PaymentList";
import { OrderItemList } from "@/components/orders/OrderItemList";

interface OrderDetailProps {
  order: Order;
  payments: OrderPayment[];
  onBack: () => void;
  onReopenOrder: (order: Order) => void;
  onPayOrder: (order: Order) => void;
}

export function OrderDetail({ 
  order, 
  payments, 
  onBack, 
  onReopenOrder, 
  onPayOrder 
}: OrderDetailProps) {
  const isOrderFullyPaid = () => {
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    return totalPaid >= order.total;
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h2 className="text-2xl font-bold">
            Order #{order.orderNumber}
          </h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <OrderSummaryCard
              order={order}
              payments={payments}
              showPaymentStatus={true}
              showOrderDetails={true}
            />

            <OrderItemList items={order.items} />
          </div>
          <PaymentList
            payments={payments}
            orderTotal={order.total}
          />
        </div>
      </div>
      <div className="flex-shrink-0 p-4 border-t bg-background">
        <div className="flex gap-4">
          <Button
            onClick={() => onReopenOrder(order)}
            className="flex-1"
            variant="outline"
          >
            Reopen Order
          </Button>
          {!order.paid && !isOrderFullyPaid() && (
            <Button
              onClick={() => onPayOrder(order)}
              className="flex-1"
              variant="outline"
            >
              Pay & Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}