'use client';

import { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { Order, OrderPayment, OrderStatus } from '@/types';
import { useOrders } from '@/lib/hooks/useOrders';
import { useRealtimeCollection } from '@/lib/hooks/useRealtimeCollection';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Receipt, User, CheckCircle, Save, Settings } from 'lucide-react';

import { OrderActionsDialog } from '@/components/orders/OrderStatusActionsDialog';


function OrdersContent() {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id || '';
  const { orders: fetchedOrders, loading: ordersLoading, updateExistingOrder } = useOrders();
  const { data: paymentsData, loading: paymentsLoading } = useRealtimeCollection<OrderPayment>('orderPayments', organizationId);

  const orderPayments = useMemo(() => {
    const map: { [orderId: string]: OrderPayment[] } = {};
    paymentsData.forEach(payment => {
      if (!map[payment.orderId]) map[payment.orderId] = [];
      map[payment.orderId].push(payment);
    });
    return map;
  }, [paymentsData]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders = fetchedOrders || [];

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'on_hold':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOrderTotalPaid = (orderId: string) => {
    const orderPaymentsForOrder = orderPayments[orderId] || [];
    return orderPaymentsForOrder.reduce((sum: number, payment: OrderPayment) => sum + payment.amount, 0);
  };



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const clearSelection = () => setSelectedOrder(null);

  const handleMarkAsPaid = async (orderId: string) => {
    await updateExistingOrder(orderId, { paid: true });
    clearSelection();
  };

  const handleCompleteOrder = async (orderId: string) => {
    await updateExistingOrder(orderId, { status: OrderStatus.COMPLETED });
    clearSelection();
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateExistingOrder(orderId, { status: newStatus });
    clearSelection();
  };

  if (ordersLoading || paymentsLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const totalPaid = getOrderTotalPaid(order.id);

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName || 'Walk-in'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{order.createdByName || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.tableName || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <span className={order.paid ? 'text-green-600 font-medium' : 'text-orange-600'}>
                        {order.paid ? formatCurrency(order.total) : formatCurrency(totalPaid)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Header */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-2">Order Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <Badge variant={getStatusColor(selectedOrder.status)} className="capitalize">
                                        {selectedOrder.status}
                                      </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Order Type:</span>
                                      <span className="capitalize">{selectedOrder.orderType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Date:</span>
                                      <span>{selectedOrder.createdAt.toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2">Customer & Table</h3>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Customer:</span>
                                      <span>{selectedOrder.customerName || 'Walk-in'}</span>
                                    </div>
                                    {selectedOrder.customerPhone && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Phone:</span>
                                        <span>{selectedOrder.customerPhone}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Table:</span>
                                      <span>{selectedOrder.tableName || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Order Items */}
                              <div>
                                <h3 className="font-semibold mb-3">Order Items</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                      <TableHead className="text-right">Unit Price</TableHead>
                                      <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedOrder.items.map((item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">{item.name}</p>
                                            {item.description && (
                                              <p className="text-sm text-gray-600">{item.description}</p>
                                            )}
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>

                              {/* Order Summary */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-3">Order Summary</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Subtotal:</span>
                                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    {selectedOrder.taxAmount > 0 && (
                                      <div className="flex justify-between">
                                        <span>Tax ({selectedOrder.taxRate}%):</span>
                                        <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                      <span>Total:</span>
                                      <span>{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                  <h3 className="font-semibold mb-3">Payment Information</h3>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span>Payment Status:</span>
                                      <Badge variant={selectedOrder.paid ? "default" : "secondary"} className={selectedOrder.paid ? "bg-green-500" : ""}>
                                        {selectedOrder.paid ? "Paid" : "Unpaid"}
                                      </Badge>
                                    </div>
                                    {orderPayments[selectedOrder.id] && orderPayments[selectedOrder.id].length > 0 ? (
                                      <>
                                        {orderPayments[selectedOrder.id].map((payment: OrderPayment, index: number) => (
                                          <div key={index} className="flex justify-between text-sm">
                                            <span>{payment.paymentMethod}:</span>
                                            <span>{formatCurrency(payment.amount)}</span>
                                          </div>
                                        ))}
                                        <div className="flex justify-between font-medium border-t pt-2">
                                          <span>Total Paid:</span>
                                          <span>{formatCurrency(totalPaid)}</span>
                                        </div>
                                        {totalPaid > selectedOrder.total && (
                                          <div className="flex justify-between text-green-600">
                                            <span>Change Due:</span>
                                            <span>{formatCurrency(totalPaid - selectedOrder.total)}</span>
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <p className="text-gray-500 text-sm">No payments recorded</p>
                                    )}
                                  </div>
                                </div>
                              </div>

                               {selectedOrder.notes && (
                                 <div>
                                   <h3 className="font-semibold mb-2">Notes</h3>
                                   <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                 </div>
                               )}

                               {/* Action Buttons - Only show when fully paid */}
                               {selectedOrder.paid && selectedOrder.status !== OrderStatus.COMPLETED && (
                                 <div className="flex gap-3 pt-4 border-t">
                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button variant="outline" className="flex-1">
                                         <Save className="h-4 w-4 mr-2" />
                                         Save for Later
                                       </Button>
                                     </AlertDialogTrigger>
                                     <AlertDialogContent>
                                       <AlertDialogHeader>
                                         <AlertDialogTitle>Save Order</AlertDialogTitle>
                                         <AlertDialogDescription>
                                           This will save the order for later processing. You can still modify it if needed.
                                         </AlertDialogDescription>
                                       </AlertDialogHeader>
                                       <AlertDialogFooter>
                                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.OPEN)}
                                          >
                                           Save Order
                                         </AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>

                                   <AlertDialog>
                                     <AlertDialogTrigger asChild>
                                       <Button className="flex-1 bg-green-600 hover:bg-green-700">
                                         <CheckCircle className="h-4 w-4 mr-2" />
                                         Mark as Completed
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
                                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, OrderStatus.COMPLETED)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                           Complete Order
                                         </AlertDialogAction>
                                       </AlertDialogFooter>
                                     </AlertDialogContent>
                                   </AlertDialog>
                                 </div>
                               )}
                             </div>
                           )}
</DialogContent>
                       </Dialog>
                       
                        <OrderActionsDialog
                          order={order}
                          payments={orderPayments[order.id] || []}
                          onMarkAsPaid={handleMarkAsPaid}
                          onUpdateStatus={handleUpdateOrderStatus}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Status
                          </Button>
                        </OrderActionsDialog>
                     </div>
                   </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Receipt className="h-12 w-12 mb-4 text-gray-400" />
                      <p>No orders found. Create your first order from the POS to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
