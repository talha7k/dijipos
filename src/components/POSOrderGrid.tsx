import { useState } from "react";
import { Order, OrderPayment, OrderStatus } from "@/types";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { OrderList } from "@/components/orders/OrderList";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { OrderActions } from "@/components/orders/OrderActions";

interface POSOrderGridProps {
  orders: Order[];
  payments: { [orderId: string]: OrderPayment[] };
  organizationId: string | undefined;
  onOrderSelect: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onBack: () => void;
  onOrderUpdate?: () => void;
}

export function POSOrderGrid({
  orders,
  payments,
  organizationId,
  onOrderSelect,
  onPayOrder,
  onBack,
  onOrderUpdate,
}: POSOrderGridProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const markOrderAsPaid = async (orderId: string) => {
    if (!organizationId) return;

    setUpdatingStatus(true);
    try {
      const orderRef = doc(
        db,
        "organizations",
        organizationId,
        "orders",
        orderId
      );
      await updateDoc(orderRef, {
        paid: true,
        updatedAt: serverTimestamp(),
      });

       toast.success("Order marked as paid successfully!");
       onOrderUpdate?.();
       setSelectedOrder(null);
    } catch (error) {
      console.error("Error marking order as paid:", error);
      toast.error("Failed to mark order as paid");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!organizationId || !selectedOrder) return;

    // Check if order is paid before completing
    if (!selectedOrder.paid) {
      toast.error(
        "Cannot complete an unpaid order. Please process payment first."
      );
      return;
    }

    setUpdatingStatus(true);
    try {
      const orderRef = doc(
        db,
        "organizations",
        organizationId,
        "orders",
        orderId
      );
      await updateDoc(orderRef, {
        status: OrderStatus.COMPLETED,
        updatedAt: serverTimestamp(),
      });

       toast.success("Order completed successfully!");
       onOrderUpdate?.();
       setSelectedOrder(null);
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Failed to complete order");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!organizationId) return;

    // Check if trying to complete an unpaid order
    if (newStatus === OrderStatus.COMPLETED && !selectedOrder?.paid) {
      toast.error(
        "Cannot complete an unpaid order. Please process payment first."
      );
      return;
    }

    setUpdatingStatus(true);
    try {
      const orderRef = doc(
        db,
        "organizations",
        organizationId,
        "orders",
        orderId
      );
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

       toast.success(
         `Order ${
           newStatus === OrderStatus.COMPLETED ? "completed" : "updated"
         } successfully!`
       );
       onOrderUpdate?.();
       setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
  };

  const handleReopenOrder = (order: Order) => {
    onOrderSelect(order);
  };

  if (selectedOrder) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <OrderDetail
          order={selectedOrder}
          payments={payments[selectedOrder.id] || []}
          onBack={handleBackToList}
          onReopenOrder={handleReopenOrder}
          onPayOrder={onPayOrder}
        />
        <div className="flex-shrink-0 p-4 border-t bg-background">
          <OrderActions
            order={selectedOrder}
            payments={payments[selectedOrder.id] || []}
            updatingStatus={updatingStatus}
            onMarkAsPaid={markOrderAsPaid}
            onCompleteOrder={completeOrder}
            onUpdateStatus={updateOrderStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <OrderList
      orders={orders}
      onOrderSelect={handleOrderSelect}
      onBack={onBack}
      onStatusChange={updateOrderStatus}
      onMarkAsPaid={markOrderAsPaid}
      onCompleteOrder={completeOrder}
      getOrderPayments={(orderId: string) => payments[orderId] || []}
    />
  );
}