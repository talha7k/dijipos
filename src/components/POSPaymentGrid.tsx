'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, DollarSign, Receipt } from 'lucide-react';
import { Order, OrderPayment, PaymentType } from '@/types';

interface POSPaymentGridProps {
  order: Order;
  paymentTypes: PaymentType[];
  onPaymentProcessed: (payments: OrderPayment[]) => void;
  onBack: () => void;
}

interface PaymentEntry {
  id: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export function POSPaymentGrid({ order, paymentTypes, onPaymentProcessed, onBack }: POSPaymentGridProps) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = order.total - totalPaid;
  const changeDue = totalPaid > order.total ? totalPaid - order.total : 0;

  // Auto-fill amount with remaining amount when payment method is selected
  useEffect(() => {
    if (paymentMethod && remainingAmount > 0 && !amount) {
      setAmount(remainingAmount.toFixed(2));
    }
  }, [paymentMethod, remainingAmount, amount]);

  const addPayment = () => {
    if (!amount || !paymentMethod) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) return;

    const newPayment: PaymentEntry = {
      id: `payment-${Date.now()}`,
      amount: paymentAmount,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    };

    setPayments([...payments, newPayment]);
    setAmount('');
    setReference('');
    setNotes('');
    setPaymentMethod('');
  };

  const removePayment = (paymentId: string) => {
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  const processPayment = () => {
    if (totalPaid < order.total) {
      alert('Payment amount does not cover the full order total.');
      return;
    }

    // Convert to OrderPayment format
    const orderPayments: OrderPayment[] = payments.map(payment => ({
      id: payment.id,
      organizationId: order.organizationId,
      orderId: order.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paymentDate: new Date(),
      reference: payment.reference || undefined,
      notes: payment.notes || undefined,
      createdAt: new Date(),
    }));

    onPaymentProcessed(orderPayments);
  };

  return (
    <div className="h-screen overflow-auto p-4 bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
        <h2 className="text-2xl font-bold">Process Payment - {order.orderNumber}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Order Total:</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-bold text-green-600">${totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-bold">Remaining:</span>
              <span className={`font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${remainingAmount.toFixed(2)}
              </span>
            </div>
            {changeDue > 0 && (
              <div className="flex justify-between">
                <span className="font-bold text-green-600">Change Due:</span>
                <span className="font-bold text-green-600">${changeDue.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{order.customerName || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{order.tableName || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Add Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reference">Reference (Optional)</Label>
              <Input
                id="reference"
                placeholder="Receipt #, Transaction ID, etc."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={addPayment} className="w-full" disabled={!amount || !paymentMethod}>
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      {payments.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <div className="font-medium">{payment.paymentMethod}</div>
                    <div className="text-sm text-muted-foreground">
                      ${payment.amount.toFixed(2)}
                      {payment.reference && ` • Ref: ${payment.reference}`}
                    </div>
                    {payment.notes && (
                      <div className="text-sm text-muted-foreground">{payment.notes}</div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePayment(payment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Payment Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={processPayment}
          disabled={totalPaid < order.total}
          size="lg"
          className="px-8"
        >
          <CreditCard className="h-5 w-5 mr-2" />
          {changeDue > 0 ? 'Process Payment & Give Change' : 'Process Payment & Complete Order'}
        </Button>
      </div>
    </div>
  );
}