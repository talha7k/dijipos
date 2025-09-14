import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock } from "lucide-react";
import { Order, OrderStatus, OrderPayment } from "@/types";
import { OrderSummaryCard } from "./OrderSummaryCard";

interface OrderListProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  onBack: () => void;
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onMarkAsPaid?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
  getOrderPayments?: (orderId: string) => OrderPayment[];
}

export function OrderList({ orders, onOrderSelect, onBack, onStatusChange, onMarkAsPaid, onCompleteOrder, getOrderPayments }: OrderListProps) {
  return (
    <div className="flex-1 overflow-auto p-4 bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <h2 className="text-2xl font-bold">Open Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p>No open orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderSummaryCard
              key={order.id}
              order={order}
              payments={getOrderPayments?.(order.id)}
              onClick={onOrderSelect}
              showPaymentStatus={true}
              showOrderDetails={true}
              showItemCount={true}
              showCreatedDate={true}
              onStatusChange={onStatusChange}
              onMarkAsPaid={onMarkAsPaid}
              onCompleteOrder={onCompleteOrder}
            />
          ))}
        </div>
      )}
    </div>
  );
}