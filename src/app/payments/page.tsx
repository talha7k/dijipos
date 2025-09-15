'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import { Payment, Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

function PaymentsContent() {
  const user = useUser();
  const organizationId = useOrganizationId();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!organizationId) return;

    // Fetch payments
    const paymentsQ = query(collection(db, 'organizations', organizationId, 'payments'));
    const paymentsUnsubscribe = onSnapshot(paymentsQ, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paymentDate: doc.data().paymentDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Payment[];
      setPayments(paymentsData);
    });

    // Fetch invoices for payment creation
    const invoicesQ = query(collection(db, 'organizations', organizationId, 'invoices'));
    const invoicesUnsubscribe = onSnapshot(invoicesQ, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Invoice[];
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => {
      paymentsUnsubscribe();
      invoicesUnsubscribe();
    };
  }, [organizationId]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId || !selectedInvoiceId) return;

    await addDoc(collection(db, 'organizations', organizationId, 'payments'), {
      organizationId,
      invoiceId: selectedInvoiceId,
      amount: parseFloat(amount),
      paymentDate: new Date(),
      paymentMethod,
      notes,
    });

    setDialogOpen(false);
    setSelectedInvoiceId('');
    setAmount('');
    setPaymentMethod('');
    setNotes('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
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
              {payments.map((payment) => {
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
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-8 w-8" />
                      <p>No payments found. Click Add Payment to get started.</p>
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