'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Trash2, Loader2 } from 'lucide-react';
import { useOrders } from '@/lib/hooks/useOrders';
import { OrderPayment } from '@/types';

interface PaymentListProps {
  orderId: string;
  orderTotal: number;
  onRemovePayment?: (paymentId: string) => void;
  showRemoveButton?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PaymentList({
  orderId,
  orderTotal,
  onRemovePayment,
  showRemoveButton = false,
  disabled = false,
  className = ''
}: PaymentListProps) {
  const { getPaymentsForOrder } = useOrders();
  const [payments, setPayments] = useState<OrderPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        setError(null);
        const orderPayments = await getPaymentsForOrder(orderId);
        setPayments(orderPayments);
      } catch (err) {
        console.error('Error fetching payments:', err);
        setError('Failed to load payments');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [orderId, getPaymentsForOrder]);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = orderTotal - totalPaid;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-12 w-12 mx-auto mb-3 opacity-50 animate-spin" />
            <p className="text-sm">Loading payments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs mt-1">Unable to load payment information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No payments recorded yet</p>
            <p className="text-xs mt-1">Click &quot;Process Payment&quot; to add a payment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments
          </span>
          <Badge variant="outline" className="text-xs">
            {totalPaid.toFixed(2)} / {orderTotal.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Method</TableHead>
                <TableHead className="w-[150px]">Amount</TableHead>
                <TableHead className="w-[180px]">Date & Time</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Notes</TableHead>
                {showRemoveButton && <TableHead className="w-[60px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
             <TableBody>
               {payments.map((payment) => (
                 <TableRow key={payment.id}>
                   <TableCell className="font-medium capitalize">
                     <div className="flex items-center gap-2">
                       <CreditCard className="h-4 w-4 text-muted-foreground" />
                       {payment.paymentMethod}
                     </div>
                   </TableCell>
                   <TableCell className="font-bold text-green-600">
                     ${payment.amount.toFixed(2)}
                   </TableCell>
                   <TableCell className="text-sm">
                     {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                   </TableCell>
                   <TableCell className="text-sm">
                     {payment.reference || '-'}
                   </TableCell>
                   <TableCell className="text-sm">
                     {payment.notes || '-'}
                   </TableCell>
                   {showRemoveButton && (
                     <TableCell>
                       {onRemovePayment && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => onRemovePayment(payment.id)}
                           disabled={disabled}
                           className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8"
                           title="Delete payment"
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                     </TableCell>
                   )}
                 </TableRow>
               ))}
             </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Paid:</span>
            <span className="text-green-600">${totalPaid.toFixed(2)}</span>
          </div>
          {remainingAmount > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Remaining:</span>
              <span>${remainingAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}