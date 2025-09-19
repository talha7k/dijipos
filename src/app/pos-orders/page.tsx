"use client";

import { useState, useMemo, useEffect } from "react";
import { useAtom } from "jotai";
import { selectedOrganizationAtom, organizationUserRoleAtom } from "@/atoms";
import { Order, OrderPayment, OrderStatus, PaymentStatus } from "@/types";
import { useOrders } from "@/lib/hooks/useOrders";
import { useCurrency } from "@/lib/hooks/useCurrency";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Receipt, User, CheckCircle, Save, Settings } from "lucide-react";

import { OrderActionsDialog } from "@/components/orders/OrderStatusActionsDialog";
import { ActionButtons } from "@/components/ui/action-buttons";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

function OrdersContent() {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const [organizationUserRole] = useAtom(organizationUserRoleAtom);
  const organizationId = selectedOrganization?.id || "";
  const {
    orders: fetchedOrders,
    loading: ordersLoading,
    updateExistingOrder,
    deleteExistingOrder,
    getPaymentsForOrder,
  } = useOrders();

  const [orderPayments, setOrderPayments] = useState<{ [orderId: string]: OrderPayment[] }>({});
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Fetch payments for all orders
  useEffect(() => {
    const fetchPaymentsForOrders = async () => {
      if (!fetchedOrders || fetchedOrders.length === 0) {
        setOrderPayments({});
        return;
      }

      setPaymentsLoading(true);
      try {
        const paymentsMap: { [orderId: string]: OrderPayment[] } = {};

        // Fetch payments for each order
        await Promise.all(
          fetchedOrders.map(async (order) => {
            try {
              const payments = await getPaymentsForOrder(order.id);
              paymentsMap[order.id] = payments;
            } catch (error) {
              console.error(`Error fetching payments for order ${order.id}:`, error);
              paymentsMap[order.id] = [];
            }
          })
        );

        setOrderPayments(paymentsMap);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPaymentsForOrders();
  }, [fetchedOrders, getPaymentsForOrder]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const orders = fetchedOrders || [];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "default";
      case "on_hold":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getOrderTotalPaid = (orderId: string) => {
    const orderPaymentsForOrder = orderPayments[orderId] || [];
    return orderPaymentsForOrder.reduce(
      (sum: number, payment: OrderPayment) => sum + payment.amount,
      0,
    );
  };

  const { formatCurrency } = useCurrency();

  const clearSelection = () => setSelectedOrder(null);

  const handleMarkAsPaid = async (orderId: string) => {
    await updateExistingOrder(orderId, { paymentStatus: PaymentStatus.PAID });
    clearSelection();
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    await updateExistingOrder(orderId, { status: newStatus });
    clearSelection();
  };

  const handleDeleteOrder = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setIsDeleting(true);
    try {
      await deleteExistingOrder(orderToDelete.id);
      console.log("Successfully deleted order:", orderToDelete.id);

      // Close the dialog and clear selection
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      clearSelection();
    } catch (error) {
      console.error("Error deleting order:", error);
      // Keep the dialog open so user can try again or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteOrder = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const isAdmin = organizationUserRole?.role === "admin";

  if (ordersLoading || paymentsLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">POS Orders</h1>
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
                 const paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;

                 return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName || "Walk-in"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{order.createdByName || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{order.tableName || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.orderType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                       <span
                         className={
                           paymentStatus === PaymentStatus.PAID
                             ? "text-green-600 font-medium"
                             : "text-orange-600"
                         }
                       >
                         {paymentStatus === PaymentStatus.PAID
                           ? formatCurrency(order.total)
                           : formatCurrency(totalPaid)}
                       </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(order.status)}
                        className="capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleDateString()}
                    </TableCell>
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
                              <DialogTitle>
                                Order Details - {selectedOrder?.orderNumber}
                              </DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6">
                                {/* Order Header */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">
                                      Order Information
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Status:
                                        </span>
                                        <Badge
                                          variant={getStatusColor(
                                            selectedOrder.status,
                                          )}
                                          className="capitalize"
                                        >
                                          {selectedOrder.status}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Order Type:
                                        </span>
                                        <span className="capitalize">
                                          {selectedOrder.orderType}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Date:
                                        </span>
                                        <span>
                                          {selectedOrder.createdAt.toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2">
                                      Customer & Table
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Customer:
                                        </span>
                                        <span>
                                          {selectedOrder.customerName ||
                                            "Walk-in"}
                                        </span>
                                      </div>
                                      {selectedOrder.customerPhone && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">
                                            Phone:
                                          </span>
                                          <span>
                                            {selectedOrder.customerPhone}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Table:
                                        </span>
                                        <span>
                                          {selectedOrder.tableName || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                  <h3 className="font-semibold mb-3">
                                    Order Items
                                  </h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">
                                          Qty
                                        </TableHead>
                                        <TableHead className="text-right">
                                          Unit Price
                                        </TableHead>
                                        <TableHead className="text-right">
                                          Total
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedOrder.items.map(
                                        (item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              <div>
                                                <p className="font-medium">
                                                  {item.name}
                                                </p>
                                                {item.description && (
                                                  <p className="text-sm text-gray-600">
                                                    {item.description}
                                                  </p>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              {formatCurrency(item.unitPrice)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                              {formatCurrency(item.total)}
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Order Summary */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Order Summary
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>
                                          {formatCurrency(
                                            selectedOrder.subtotal,
                                          )}
                                        </span>
                                      </div>
                                      {selectedOrder.taxAmount > 0 && (
                                        <div className="flex justify-between">
                                          <span>
                                            Tax ({selectedOrder.taxRate}%):
                                          </span>
                                          <span>
                                            {formatCurrency(
                                              selectedOrder.taxAmount,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>
                                          {formatCurrency(selectedOrder.total)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div>
                                    <h3 className="font-semibold mb-3">
                                      Payment Information
                                    </h3>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Payment Status:</span>
                                        <Badge
                                          variant={
                                            selectedOrder.paymentStatus === PaymentStatus.PAID
                                              ? "default"
                                              : "secondary"
                                          }
                                          className={
                                            selectedOrder.paymentStatus === PaymentStatus.PAID
                                              ? "bg-green-500"
                                              : ""
                                          }
                                        >
                                          {selectedOrder.paymentStatus === PaymentStatus.PAID
                                            ? "Paid"
                                            : "Unpaid"}
                                        </Badge>
                                      </div>
                                      {orderPayments[selectedOrder.id] &&
                                      orderPayments[selectedOrder.id].length >
                                        0 ? (
                                        <>
                                          {orderPayments[selectedOrder.id].map(
                                            (
                                              payment: OrderPayment,
                                              index: number,
                                            ) => (
                                              <div
                                                key={index}
                                                className="flex justify-between text-sm"
                                              >
                                                <span>
                                                  {payment.paymentMethod}:
                                                </span>
                                                <span>
                                                  {formatCurrency(
                                                    payment.amount,
                                                  )}
                                                </span>
                                              </div>
                                            ),
                                          )}
                                          <div className="flex justify-between font-medium border-t pt-2">
                                            <span>Total Paid:</span>
                                            <span>
                                              {formatCurrency(totalPaid)}
                                            </span>
                                          </div>
                                          {totalPaid > selectedOrder.total && (
                                            <div className="flex justify-between text-green-600">
                                              <span>Change Due:</span>
                                              <span>
                                                {formatCurrency(
                                                  totalPaid -
                                                    selectedOrder.total,
                                                )}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <p className="text-gray-500 text-sm">
                                          No payments recorded
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {selectedOrder.notes && (
                                  <div>
                                    <h3 className="font-semibold mb-2">
                                      Notes
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {selectedOrder.notes}
                                    </p>
                                  </div>
                                )}

                                {/* Action Buttons - Only show when fully paid */}
                                {selectedOrder.paymentStatus === PaymentStatus.PAID &&
                                  selectedOrder.status !==
                                    OrderStatus.COMPLETED && (
                                    <div className="flex gap-3 pt-4 border-t">
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="flex-1"
                                          >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save for Later
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Save Order
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will save the order for later
                                              processing. You can still modify
                                              it if needed.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleUpdateOrderStatus(
                                                  selectedOrder.id,
                                                  OrderStatus.OPEN,
                                                )
                                              }
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
                                            <AlertDialogTitle>
                                              Complete Order
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will mark the order as
                                              completed. This action cannot be
                                              undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                handleUpdateOrderStatus(
                                                  selectedOrder.id,
                                                  OrderStatus.COMPLETED,
                                                )
                                              }
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

                        <div className="flex items-center gap-2">
                          <OrderActionsDialog
                            order={order}
                            onUpdateStatus={handleUpdateOrderStatus}
                          >
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4 mr-1" />
                              Status
                            </Button>
                          </OrderActionsDialog>

                          {isAdmin && (
                            <ActionButtons
                              onDelete={() => handleDeleteOrder(order)}
                              showEdit={false}
                              showDelete={true}
                              className="flex"
                            />
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center">
                      <Receipt className="h-12 w-12 mb-4 text-gray-400" />
                      <p>
                        No orders found. Create your first order from the POS to
                        get started.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={cancelDeleteOrder}
        onConfirm={confirmDeleteOrder}
        title="Delete Order"
        description={`Are you sure you want to delete order #${orderToDelete?.orderNumber}? This action cannot be undone and will permanently remove the order and all associated data.`}
        confirmText="Delete Order"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default function OrdersPage() {
  return <OrdersContent />;
}
