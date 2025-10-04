'use client';

import { useState, useMemo } from 'react';
import { usePayments } from '@/lib/hooks/usePayments';
import { useInvoices } from '@/lib/hooks/useInvoices';


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
  const { payments, loading: paymentsLoading, createPayment } = usePayments();
  const { salesInvoices, purchaseInvoices, loading: invoicesLoading } = useInvoices();
  const invoices = [...salesInvoices, ...purchaseInvoices];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState({});

  const columns = [
    { accessorKey: 'invoiceName', header: 'Invoice', filterType: 'text' as const },
    { accessorKey: 'paymentMethod', header: 'Payment Method', filterType: 'text' as const },
    { accessorKey: 'amount', header: 'Amount', filterType: 'text' as const },
    { accessorKey: 'paymentDate', header: 'Date', filterType: 'date' as const },
  ];

  const filteredPayments = useMemo(() => {
    return (payments || []).filter(payment => {
      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
      const invoiceName = invoice ? (invoice.type === 'sales' ? invoice.clientName : invoice.supplierName || 'Unknown') : 'Unknown';

      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        switch (key) {
          case 'invoiceName':
            return invoiceName.toLowerCase().includes((value as string).toLowerCase());
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
  }, [payments, invoices, filters]);

  const loading = paymentsLoading || invoicesLoading;

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) return;

    try {
      await createPayment({
        invoiceId: selectedInvoiceId,
        amount: parseFloat(amount),
        paymentDate: new Date(),
        paymentMethod,
        notes: notes || undefined,
      });

      setDialogOpen(false);
      setSelectedInvoiceId('');
      setAmount('');
      setPaymentMethod('');
      setNotes('');
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
                <Label htmlFor="invoice">Invoice</Label>
                <Select value={selectedInvoiceId} onValueChange={setSelectedInvoiceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                     {invoices.map((invoice) => (
                       <SelectItem key={invoice.id} value={invoice.id}>
                         {invoice.type === 'sales' ? invoice.clientName : `${invoice.supplierName || 'Unknown'} (Purchase)`} - ${invoice.total.toFixed(2)}
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
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
             <TableBody>
               {filteredPayments.map((payment) => {
                 const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                 return (
                   <TableRow key={payment.id}>
                      <TableCell>{invoice ? (invoice.type === 'sales' ? invoice.clientName : invoice.supplierName || 'Unknown') : 'Unknown'}</TableCell>
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
                       <p>{payments.length === 0 ? "No payments found. Click Add Payment to get started." : "No payments match your filters."}</p>
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