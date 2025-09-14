import { Order, OrderPayment, OrderStatus } from "@/types";
import { OrderList } from "@/components/orders/OrderList";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { useOrderManagement } from "@/hooks/orders/use-order-management";
import { useOrderSelection } from "@/hooks/orders/use-order-selection";
import { useOrderContext } from "@/contexts/OrderContext";

interface POSOrderGridProps {
  organizationId: string | undefined;
  onOrderUpdate?: () => void;
}

export function POSOrderGrid({
  organizationId,
  onOrderUpdate,
}: POSOrderGridProps) {
  const { orders, payments, onOrderSelect, onPayOrder, onBack } = useOrderContext();
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

  const handleUpdateOrderStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    const success = await updateOrderStatus(selectedOrder, newStatus, payments);
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
    handleUpdateOrderStatus(status);
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

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        payments={payments[selectedOrder.id] || []}
        updatingStatus={updatingStatus}
        onBack={handleBackToList}
        onReopenOrder={handleReopenOrder}
        onPayOrder={onPayOrder}
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