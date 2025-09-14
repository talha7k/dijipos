import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Clock, CheckCircle, XCircle, Save, DollarSign } from 'lucide-react';
import { Order, OrderPayment, OrderStatus } from '@/types';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { OrderSummaryCard } from './shared/OrderSummaryCard';
import { PaymentList } from './shared/PaymentList';
import { OrderItemList } from './shared/OrderItemList';

interface POSOrderGridProps {
  orders: Order[];
  payments: { [orderId: string]: OrderPayment[] };
  organizationId: string | undefined;
  onOrderSelect: (order: Order) => void;
  onPayOrder: (order: Order) => void;
  onBack: () => void;
}

export function POSOrderGrid({ orders, payments, organizationId, onOrderSelect, onPayOrder, onBack }: POSOrderGridProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'saved':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'saved':
        return <Save className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOrderTotalPaid = (orderId: string) => {
    const orderPayments = payments[orderId] || [];
    return orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const isOrderFullyPaid = (order: Order) => {
    const totalPaid = getOrderTotalPaid(order.id);
    return totalPaid >= order.total;
  };

  const markOrderAsPaid = async (orderId: string) => {
    if (!organizationId) return;

    setUpdatingStatus(true);
    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        paid: true,
        updatedAt: serverTimestamp(),
      });

      toast.success('Order marked as paid successfully!');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error marking order as paid:', error);
      toast.error('Failed to mark order as paid');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const completeOrder = async (orderId: string) => {
    if (!organizationId || !selectedOrder) return;

    // Check if order is paid before completing
    if (!selectedOrder.paid) {
      toast.error('Cannot complete an unpaid order. Please process payment first.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        status: OrderStatus.COMPLETED,
        updatedAt: serverTimestamp(),
      });

      toast.success('Order completed successfully!');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error('Failed to complete order');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!organizationId) return;

    // Check if trying to complete an unpaid order
    if (newStatus === OrderStatus.COMPLETED && !selectedOrder?.paid) {
      toast.error('Cannot complete an unpaid order. Please process payment first.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const orderRef = doc(db, 'organizations', organizationId, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      toast.success(`Order ${newStatus === OrderStatus.COMPLETED ? 'completed' : 'saved'} successfully!`);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (selectedOrder) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <h2 className="text-2xl font-bold">Order #{selectedOrder.orderNumber}</h2>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderSummaryCard
              order={selectedOrder}
              showPaymentStatus={true}
              showOrderDetails={true}
            />

            <OrderItemList items={selectedOrder.items} />

             {/* Payments Section */}
            <PaymentList
              payments={payments[selectedOrder.id] || []}
              orderTotal={selectedOrder.total}
            />
           </div>
         </div>

        <div className="flex-shrink-0 p-4 border-t bg-background">
          <div className="flex gap-4">
            <Button
              onClick={() => onOrderSelect(selectedOrder)}
              className="flex-1"
              variant="outline"
            >
              Reopen Order
            </Button>
            {!isOrderFullyPaid(selectedOrder) && (
              <Button
                onClick={() => onPayOrder(selectedOrder)}
                className="flex-1"
                variant="outline"
              >
                Pay & Complete
              </Button>
            )}
          </div>

          {/* Order Actions Section */}
          <div className="mt-4 space-y-4">
            {/* Payment Actions */}
            {!selectedOrder.paid && isOrderFullyPaid(selectedOrder) && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-3">Payment Complete:</h3>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        disabled={updatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {updatingStatus ? 'Marking...' : 'Mark as Paid'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Order as Paid</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the order as paid but keep it open for further processing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => markOrderAsPaid(selectedOrder.id)}
                          disabled={updatingStatus}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updatingStatus ? 'Marking...' : 'Mark as Paid'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* Order Status Actions */}
            {selectedOrder.paid && selectedOrder.status !== OrderStatus.COMPLETED && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-3">Ready to Complete:</h3>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={updatingStatus}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {updatingStatus ? 'Completing...' : 'Complete Order'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Complete Order</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the order as completed. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => completeOrder(selectedOrder.id)}
                          disabled={updatingStatus}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {updatingStatus ? 'Completing...' : 'Complete Order'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {/* General Actions */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Other Actions:</h3>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateOrderStatus(selectedOrder.id, OrderStatus.SAVED)}
                  disabled={updatingStatus}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatingStatus ? 'Saving...' : 'Save for Later'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedOrder(null)}
                  disabled={updatingStatus}
                >
                  Keep Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedOrder(order)}
            >
               <CardHeader className="pb-2">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
<div className="flex items-center gap-2">
                      {/* Order Status */}
                      <Badge className={`${getStatusColor(order.status)} text-white`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      
                      {/* Payment Status */}
                      <Badge variant={order.paid ? "default" : "secondary"} className={order.paid ? "bg-green-600 text-white" : "bg-orange-100 text-orange-800"}>
                        {order.paid ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-3 w-3 mr-1" />
                            Unpaid
                          </>
                        )}
                      </Badge>
                    </div>
                 </div>
               </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Customer:</span>
                  <span>{order.customerName || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Table:</span>
                  <span>{order.tableName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span>{order.createdAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}