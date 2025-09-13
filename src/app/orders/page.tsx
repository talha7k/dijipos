'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Order, OrderPayment, PaymentType, Organization, User as AppUser } from '@/types';
import { useOrdersData } from '@/hooks/use-orders-data';
import { useUsersData } from '@/hooks/use-users-data';
import { usePaymentTypesData } from '@/hooks/use-payment-types-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Receipt, CreditCard, Users, LayoutGrid, ShoppingBag, Calendar, DollarSign, User } from 'lucide-react';

function OrdersContent() {
  const { user, organizationId } = useAuth();
  const { orders, loading: ordersLoading } = useOrdersData(organizationId || undefined);
  const { users: usersArray, loading: usersLoading } = useUsersData(organizationId || undefined);
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypesData(organizationId || undefined);
  const [users, setUsers] = useState<{ [userId: string]: AppUser }>({});
  const [payments, setPayments] = useState<{ [orderId: string]: OrderPayment[] }>({});
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    // Fetch organization data
    const fetchOrganization = async () => {
      const organizationDoc = await getDoc(doc(db, 'organizations', organizationId));
      if (organizationDoc.exists()) {
        setOrganization({
          id: organizationDoc.id,
          ...organizationDoc.data(),
          createdAt: organizationDoc.data().createdAt?.toDate(),
        } as Organization);
      }
    };
    fetchOrganization();

    // Update loading state based on all data sources
    const allDataLoaded = !ordersLoading && !usersLoading && !paymentTypesLoading;
    setLoading(!allDataLoaded);

    // Map users array to dictionary for easy lookup
    if (usersArray) {
      const usersById: { [userId: string]: AppUser } = {};
      usersArray.forEach((user: AppUser) => {
        usersById[user.id] = user;
      });
      setUsers(usersById);
    }

    // Fetch payments for each order
    const paymentsQ = query(collection(db, 'organizations', organizationId, 'orderPayments'));
    const paymentsUnsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as OrderPayment[];
      
      // Group payments by orderId
      const paymentsByOrder: { [orderId: string]: OrderPayment[] } = {};
      paymentsData.forEach(payment => {
        if (!paymentsByOrder[payment.orderId]) {
          paymentsByOrder[payment.orderId] = [];
        }
        paymentsByOrder[payment.orderId].push(payment);
      });
      setPayments(paymentsByOrder);
    });

    return () => {
      paymentsUnsubscribe();
    };
  }, [organizationId, ordersLoading, usersLoading, paymentTypesLoading, usersArray]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'saved':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOrderTotalPaid = (orderId: string) => {
    const orderPayments = payments[orderId] || [];
    return orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

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
                const isFullyPaid = totalPaid >= order.total;
                
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
                      <span className={isFullyPaid ? 'text-green-600 font-medium' : 'text-orange-600'}>
                        {formatCurrency(totalPaid)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell>
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
                                  {payments[selectedOrder.id] && payments[selectedOrder.id].length > 0 ? (
                                    <div className="space-y-2">
                                      {payments[selectedOrder.id].map((payment, index) => (
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
                                    </div>
                                  ) : (
                                    <p className="text-gray-500 text-sm">No payments recorded</p>
                                  )}
                                </div>
                              </div>

                              {selectedOrder.notes && (
                                <div>
                                  <h3 className="font-semibold mb-2">Notes</h3>
                                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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