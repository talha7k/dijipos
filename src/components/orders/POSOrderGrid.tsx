import { Order, OrderPayment, OrderStatus } from "@/types";
import { OrderList } from "@/components/orders/OrderList";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { useOrderManagement } from "@/hooks/orders/use-order-management";
import { useOrderSelection } from "@/hooks/orders/use-order-selection";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, Clock } from "lucide-react";
import { OrderSummaryCard } from "./OrderSummaryCard";

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
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'completed' | 'preparing' | 'cancelled' | 'on_hold'>('open');

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

  const filteredOrders = orders.filter(order => {
    switch (filterStatus) {
      case 'open':
        return order.status === OrderStatus.OPEN;
      case 'completed':
        return order.status === OrderStatus.COMPLETED;
      case 'preparing':
        return order.status === OrderStatus.PREPARING;
      case 'cancelled':
        return order.status === OrderStatus.CANCELLED;
      case 'on_hold':
        return order.status === OrderStatus.ON_HOLD;
      case 'all':
      default:
        return true;
    }
  });

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
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {/* <h2 className="text-2xl font-bold capitalize">
            {filterStatus === 'open' ? 'Open Orders' : 
             filterStatus === 'completed' ? 'Completed Orders' : 
             filterStatus === 'preparing' ? 'Preparing Orders' : 
             filterStatus === 'cancelled' ? 'Cancelled Orders' : 
             filterStatus === 'on_hold' ? 'On Hold Orders' : 
             'All Orders'}
          </h2> */}
        <div className="ml-auto">
          <ToggleGroup 
             type="single" 
             value={filterStatus} 
             onValueChange={(value) => setFilterStatus(value as 'all' | 'open' | 'completed' | 'preparing' | 'cancelled' | 'on_hold')}
           >
             <ToggleGroupItem value="open" aria-label="Open orders">
               Open
             </ToggleGroupItem>
            
             <ToggleGroupItem value="completed" aria-label="Completed orders">
               Completed
             </ToggleGroupItem>
             <ToggleGroupItem value="on_hold" aria-label="On hold orders">
               On Hold
             </ToggleGroupItem>
             <ToggleGroupItem value="cancelled" aria-label="Cancelled orders">
               Cancelled
             </ToggleGroupItem>
             <ToggleGroupItem value="all" aria-label="All orders">
               All
             </ToggleGroupItem>
           </ToggleGroup>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No {filterStatus === 'open' ? 'open' : 
                      filterStatus === 'completed' ? 'completed' : 
                      filterStatus === 'preparing' ? 'preparing' : 
                      filterStatus === 'cancelled' ? 'cancelled' : 
                      filterStatus === 'on_hold' ? 'on hold' : ''} orders found</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderSummaryCard
                key={order.id}
                order={order}
                payments={payments[order.id] || []}
                onClick={handleOrderSelect}
                showPaymentStatus={true}
                showOrderDetails={true}
                showItemCount={true}
                showCreatedDate={true}
                onStatusChange={wrapUpdateStatus}
                onMarkAsPaid={wrapMarkAsPaid}
                onCompleteOrder={wrapCompleteOrder}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}