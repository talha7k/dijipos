'use client';

import { useState, useMemo, useEffect } from 'react';
import { useOrders } from '@/lib/hooks/useOrders';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { OrderPayment } from '@/types';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { TableFilter } from '@/components/shared/TableFilter';

function PaymentsContent() {
  const { selectedOrganization } = useOrganization();
  const { orders, loading: ordersLoading, addPaymentToOrder, getPaymentsForOrder } = useOrders();
  const [orderPayments, setOrderPayments] = useState<OrderPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState({});

  // Fetch all order payments
  useEffect(() => {
    const fetchAllOrderPayments = async () => {
      if (!orders.length) return;
      setLoadingPayments(true);
      try {
        const paymentsPromises = orders.map(order => getPaymentsForOrder(order.id));
        const paymentsArrays = await Promise.all(paymentsPromises);
        const allPayments = paymentsArrays.flat();
        setOrderPayments(allPayments);
      } catch (error) {
        console.error('Error fetching order payments:', error);
      } finally {
        setLoadingPayments(false);
      }
    };
    fetchAllOrderPayments();
  }, [orders, getPaymentsForOrder]);

  const columns = [
    { accessorKey: 'orderNumber', header: 'Order', filterType: 'text' as const },
    { accessorKey: 'paymentMethod', header: 'Payment Method', filterType: 'text' as const },
    { accessorKey: 'amount', header: 'Amount', filterType: 'text' as const },
    { accessorKey: 'paymentDate', header: 'Date', filterType: 'date' as const },
  ];

  const filteredPayments = useMemo(() => {
    return orderPayments.filter(payment => {
      const order = orders.find(o => o.id === payment.orderId);
      const orderNumber = order ? order.orderNumber : 'Unknown';

      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        switch (key) {
          case 'orderNumber':
            return orderNumber.toLowerCase().includes((value as string).toLowerCase());
          case 'paymentMethod':
            return payment.paymentMethod.toLowerCase().includes((value as string).toLowerCase());
          case 'amount':
            return payment.amount.toString().includes(value as string);
          case 'paymentDate':
            return payment.paymentDate?.toLocaleDateString().toLowerCase().includes((value as string).toLowerCase()) || false;
          default:
            return true;
        }
      });
    });
  }, [orderPayments, orders, filters]);

  const loading = ordersLoading || loadingPayments;

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedOrganization?.id) return;

    try {
      await addPaymentToOrder(selectedOrderId, {
        organizationId: selectedOrganization.id,
        amount: parseFloat(amount),
        paymentDate: new Date(),
        paymentMethod,
        notes: notes || undefined,
      });

      setDialogOpen(false);
      setSelectedOrderId('');
      setAmount('');
      setPaymentMethod('');
      setNotes('');
      // Refetch payments
      const paymentsPromises = orders.map(order => getPaymentsForOrder(order.id));
      const paymentsArrays = await Promise.all(paymentsPromises);
      const allPayments = paymentsArrays.flat();
      setOrderPayments(allPayments);
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          Payments
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPayment} className="space-y-4">
               <div>
                 <Label htmlFor="order">Order</Label>
                 <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select order" />
                   </SelectTrigger>
                   <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                            {order.orderNumber} - ${order.total.toFixed(2)}
                        </SelectItem>
                      ))}
                   </SelectContent>
                 </Select>
               </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Input
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit">Add Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

       <Card>
         <CardHeader>
           <CardTitle>All Payments</CardTitle>
         </CardHeader>
         <CardContent>
           <TableFilter columns={columns} onFilterChange={setFilters} />
            <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Order</TableHead>
                 <TableHead>Amount</TableHead>
                 <TableHead>Method</TableHead>
                 <TableHead>Date</TableHead>
                 <TableHead>Notes</TableHead>
               </TableRow>
             </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const order = orders.find(o => o.id === payment.orderId);
                  return (
                    <TableRow key={payment.id}>
                         <TableCell>{order ? order.orderNumber : 'Unknown'}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.paymentMethod}</TableCell>
                      <TableCell>{payment.paymentDate?.toLocaleDateString()}</TableCell>
                      <TableCell>{payment.notes}</TableCell>
                    </TableRow>
                  );
                })}
               {filteredPayments.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        <p>{orderPayments.length === 0 ? "No payments found. Click Add Payment to get started." : "No payments match your filters."}</p>
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

export default function PaymentsPage() {
  return <PaymentsContent />;
}