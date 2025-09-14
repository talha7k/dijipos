import { Order, OrderPayment, OrderStatus } from "@/types";
import { OrderList } from "@/components/orders/OrderList";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { useOrderManagement } from "@/hooks/orders/use-order-management";
import { useOrderSelection } from "@/hooks/orders/use-order-selection";

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
  const { selectedOrder, selectOrder, clearSelection } = useOrderSelection();
  const { markOrderAsPaid, completeOrder, updateOrderStatus, updatingStatus } = useOrderManagement(organizationId);

  const handleMarkAsPaid = async (orderId: string) => {
    const success = await markOrderAsPaid(orderId);
    if (success) {
      onOrderUpdate?.();
      clearSelection();
    }
  };

  const handleCompleteOrder = async () => {
    if (!selectedOrder) return;
    const success = await completeOrder(selectedOrder, payments);
    if (success) {
      onOrderUpdate?.();
      clearSelection();
    }
  };

  const handleUpdateOrderStatus = async (order: Order, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(order, newStatus, payments);
    if (success) {
      onOrderUpdate?.();
      clearSelection();
    }
  };

  const wrapMarkAsPaid = (orderId: string) => {
    handleMarkAsPaid(orderId);
  };

  const wrapCompleteOrder = (orderId: string) => {
    handleCompleteOrder();
  };

  const wrapUpdateStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      handleUpdateOrderStatus(order, status);
    }
  };

  const handleOrderSelect = (order: Order) => {
    selectOrder(order);
  };

  const handleBackToList = () => {
    clearSelection();
  };

  const handleReopenOrder = (order: Order) => {
    onOrderSelect(order);
  };

  const handlePayOrder = (order: Order) => {
    onPayOrder(order);
  };

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        payments={payments[selectedOrder.id] || []}
        updatingStatus={updatingStatus}
        onBack={handleBackToList}
        onReopenOrder={handleReopenOrder}
        onPayOrder={handlePayOrder}
        onMarkAsPaid={wrapMarkAsPaid}
        onCompleteOrder={wrapCompleteOrder}
        onUpdateStatus={wrapUpdateStatus}
      />
    );
  }

  return (
    <OrderList
      orders={orders}
      onOrderSelect={handleOrderSelect}
      onBack={onBack}
      onStatusChange={wrapUpdateStatus}
      onMarkAsPaid={wrapMarkAsPaid}
      onCompleteOrder={wrapCompleteOrder}
      getOrderPayments={(orderId: string) => payments[orderId] || []}
    />
  );
}