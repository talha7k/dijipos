'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, CreditCard, Clock, XCircle, Save } from "lucide-react";
import { Order, OrderStatus, OrderPayment } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderActionsDialogProps {
  order: Order;
  payments?: OrderPayment[];
  updatingStatus?: boolean;
  children: React.ReactNode;
  onMarkAsPaid?: (orderId: string) => Promise<void>;
  onCompleteOrder?: (orderId: string) => Promise<void>;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => Promise<void>;
}

export function OrderActionsDialog({
  order,
  payments = [],
  updatingStatus = false,
  children,
  onMarkAsPaid,
  onCompleteOrder,
  onUpdateStatus
}: OrderActionsDialogProps) {
  const [open, setOpen] = useState(false);
  
  const isOrderFullyPaid = () => {
    // If order is already marked as paid, trust that status
    if (order.paid) return true;
    
    // Otherwise check payments if available
    if (payments && payments.length > 0) {
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      return totalPaid >= order.total;
    }
    
    return false;
  };

  const handleAction = async (action: () => Promise<void> | void) => {
    try {
      const result = action();
      if (result instanceof Promise) {
        await result;
      }
      setOpen(false);
    } catch (error) {
      console.error('Error in handleAction:', error);
      // Don't close dialog on error
    }
  };

  const isStatusSelected = (status: OrderStatus) => {
    return order.status === status;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Order Actions</DialogTitle>
          <DialogDescription>
            Manage order status and actions for Order #{order.orderNumber}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
           <Button
             variant={isStatusSelected(OrderStatus.OPEN) ? "default" : "outline"}
             onClick={() => handleAction(() => onUpdateStatus?.(order.id, OrderStatus.OPEN))}
             className={cn(
               "flex flex-col h-20 gap-2",
               isStatusSelected(OrderStatus.OPEN) ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "text-yellow-600"
             )}
             disabled={updatingStatus}
           >
            <Clock className="h-6 w-6" />
             <span className="text-sm">Open</span>
          </Button>
           <Button
             variant={isStatusSelected(OrderStatus.ON_HOLD) ? "default" : "outline"}
             onClick={() => handleAction(() => onUpdateStatus?.(order.id, OrderStatus.ON_HOLD))}
             className={cn(
               "flex flex-col h-20 gap-2",
               isStatusSelected(OrderStatus.ON_HOLD) ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-blue-600"
             )}
             disabled={updatingStatus}
           >
            <Save className="h-6 w-6" />
             <span className="text-sm">On Hold</span>
          </Button>
           <Button
             variant={order.status === OrderStatus.COMPLETED ? "default" : "outline"}
             onClick={() => handleAction(() => onUpdateStatus?.(order.id, OrderStatus.COMPLETED))}
             className={cn(
               "flex flex-col h-20 gap-2",
               order.status === OrderStatus.COMPLETED ? "bg-green-600 hover:bg-green-700 text-white" : "text-green-600"
             )}
             disabled={updatingStatus || !order.paid}
           >
            <CheckCircle className="h-6 w-6" />
             <span className="text-sm">Completed</span>
          </Button>
           <Button
             variant={isStatusSelected(OrderStatus.CANCELLED) ? "default" : "outline"}
             onClick={() => handleAction(() => onUpdateStatus?.(order.id, OrderStatus.CANCELLED))}
             className={cn(
               "flex flex-col h-20 gap-2",
               isStatusSelected(OrderStatus.CANCELLED) ? "bg-red-600 hover:bg-red-700 text-white" : "text-red-600"
             )}
             disabled={updatingStatus}
           >
            <XCircle className="h-6 w-6" />
             <span className="text-sm">Cancelled</span>
          </Button>
        </div>
        <DialogFooter>
          {!order.paid && isOrderFullyPaid() && (
            <Button
              onClick={() => handleAction(() => onMarkAsPaid?.(order.id))}
              className="w-full"
              disabled={updatingStatus}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {updatingStatus ? "Marking..." : "Mark as Paid"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}