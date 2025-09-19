import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Order, OrderPayment } from "@/types";
import { OrderSummaryCard } from "@/components/pos/OrderSummaryCard";
import { PaymentList } from "@/components/pos/PaymentList";
import { OrderDetailItemList } from "./OrderDetailItemList";

interface OrderDetailProps {
  order: Order;
  payments: OrderPayment[];
  onBack: () => void;
  onReopenOrder: (order: Order) => void;
}

export function OrderDetail({
  order,
  payments,
  onBack,
  onReopenOrder,
}: OrderDetailProps) {
  return (
    <div className="h-screen flex flex-col bg-background pb-15">
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h2 className="text-2xl font-bold">Order #{order.orderNumber}</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <OrderSummaryCard
              order={order}
              payments={payments} //due to print dialog display of payments.
              showPaymentStatus={true}
              showOrderDetails={true}
            />

            <OrderDetailItemList
              items={order.items}
              headerAction={
                <Button
                  onClick={() => onReopenOrder(order)}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                >
                  Reopen Order
                </Button>
              }
            />
          </div>
          <div className="mb-6">
            <PaymentList payments={payments} orderTotal={order.total} />
          </div>
        </div>
      </div>
    </div>
  );
}
