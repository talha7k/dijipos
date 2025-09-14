'use client';

import { useState } from "react";
import { Order, OrderPayment, OrderStatus, TableStatus } from "@/types";
import { serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useOrderActions } from "@/hooks/orders/use-order-data";
import { useTableActions } from "@/hooks/tables/use-tables-data";

export function useOrderManagement(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { updateOrder } = useOrderActions(organizationId);
  const { updateTable } = useTableActions(organizationId);

  const markOrderAsPaid = async (orderId: string) => {
    if (!organizationId) return;

    setUpdatingStatus(true);
    try {
      await updateOrder(orderId, {
        paid: true,
        updatedAt: new Date(),
      });

      toast.success("Order marked as paid successfully!");
      return true;
    } catch (error) {
      console.error("Error marking order as paid:", error);
      toast.error("Failed to mark order as paid");
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const completeOrder = async (order: Order, payments: { [orderId: string]: OrderPayment[] }) => {
    if (!organizationId) return false;
    
    // Check if order is paid before completing
    let isPaid = order.paid;
    
    // Fallback: check payments directly if paid field is false
    if (!isPaid && payments[order.id]) {
      const orderPayments = payments[order.id];
      const totalPaid = orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
      isPaid = totalPaid >= order.total;
    }
    
    if (!isPaid) {
      toast.error(
        "Cannot complete an unpaid order. Please process payment first."
      );
      return false;
    }

    setUpdatingStatus(true);
    try {
      // Update order status to completed
      await updateOrder(order.id, {
        status: OrderStatus.COMPLETED,
        updatedAt: new Date(),
      });

      // Release the table if this order has one assigned
      if (order.tableId) {
        await updateTable(order.tableId, {
          status: TableStatus.AVAILABLE,
          updatedAt: new Date(),
        });
      }

      toast.success("Order completed successfully! Table released.");
      return true;
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Failed to complete order");
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateOrderStatus = async (
    order: Order, 
    newStatus: OrderStatus, 
    payments: { [orderId: string]: OrderPayment[] }
  ) => {
    if (!organizationId) return false;
    
    // Check if trying to complete an unpaid order
    if (newStatus === OrderStatus.COMPLETED) {
      let isPaid = order.paid;
      
      // Fallback: check payments directly if paid field is false
      if (!isPaid && payments[order.id]) {
        const orderPayments = payments[order.id];
        const totalPaid = orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
        isPaid = totalPaid >= order.total;
      }
      
      if (!isPaid) {
        toast.error(
            "Cannot complete an unpaid order. Please process payment first."
          );
        return false;
      }
    }

    setUpdatingStatus(true);
    try {
      // Update order status
      await updateOrder(order.id, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Release table if order is being completed
      if (newStatus === OrderStatus.COMPLETED && order.tableId) {
        await updateTable(order.tableId, {
          status: TableStatus.AVAILABLE,
          updatedAt: new Date(),
        });
      }

      toast.success(
        `Order ${
          newStatus === OrderStatus.COMPLETED ? "completed" : "updated"
        } successfully!${newStatus === OrderStatus.COMPLETED && order.tableId ? ' Table released.' : ''}`
      );
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
      return false;
    } finally {
      setUpdatingStatus(false);
    }
  };

  return {
    markOrderAsPaid,
    completeOrder,
    updateOrderStatus,
    updatingStatus,
  };
}