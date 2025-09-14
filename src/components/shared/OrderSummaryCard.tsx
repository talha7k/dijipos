
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, CheckCircle, CreditCard } from 'lucide-react';
import { Order } from '@/types';

interface OrderSummaryCardProps {
  order: Order;
  showPaymentStatus?: boolean;
  showOrderDetails?: boolean;
  totalPaid?: number;
  remainingAmount?: number;
  changeDue?: number;
  className?: string;
}

export function OrderSummaryCard({
  order,
  showPaymentStatus = true,
  showOrderDetails = true,
  totalPaid,
  remainingAmount,
  changeDue,
  className = ''
}: OrderSummaryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'preparing':
        return 'bg-blue-500';
      case 'open':
        return 'bg-yellow-500';
      case 'saved':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      case 'preparing':
        return <Receipt className="h-3 w-3" />;
      default:
        return <Receipt className="h-3 w-3" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Order Number:</span>
          <span className="font-bold">{order.orderNumber}</span>
        </div>

        <div className="flex justify-between">
          <span>Order Total:</span>
          <span className="font-bold">${order.total.toFixed(2)}</span>
        </div>

        {totalPaid !== undefined && (
          <div className="flex justify-between">
            <span>Total Paid:</span>
            <span className="font-bold text-green-600">${totalPaid.toFixed(2)}</span>
          </div>
        )}

        {remainingAmount !== undefined && (
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold">Remaining:</span>
            <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${remainingAmount.toFixed(2)}
            </span>
          </div>
        )}

        {changeDue !== undefined && changeDue > 0 && (
          <div className="flex justify-between">
            <span className="font-bold text-green-600">Change Due:</span>
            <span className="font-bold text-green-600">${changeDue.toFixed(2)}</span>
          </div>
        )}

        {showPaymentStatus && (
          <div className="flex justify-between items-center">
            <span>Payment Status:</span>
            <Badge variant={order.paid ? "default" : "secondary"} className={order.paid ? "bg-green-500" : ""}>
              {order.paid ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Paid
                </>
              ) : (
                <>
                  <CreditCard className="h-3 w-3 mr-1" />
                  Unpaid
                </>
              )}
            </Badge>
          </div>
        )}

        {showOrderDetails && (
          <>
            <div className="flex justify-between">
              <span>Status:</span>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{order.customerName || 'Walk-in'}</span>
            </div>

            <div className="flex justify-between">
              <span>Table:</span>
              <span>{order.tableName || 'N/A'}</span>
            </div>

            <div className="flex justify-between">
              <span>Order Type:</span>
              <span className="capitalize">{order.orderType}</span>
            </div>

            <div className="flex justify-between">
              <span>Created:</span>
              <span>{order.createdAt.toLocaleString()}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}