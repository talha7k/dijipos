'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { Order, OrderPayment, PaymentType } from '@/types';
import { toast } from 'sonner';
import { OrderSummaryCard } from './OrderSummaryCard';
import { PaymentList } from './PaymentList';
import { PaymentEntryForm } from './PaymentEntryForm';

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
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = order.total - totalPaid;
  const changeDue = totalPaid > order.total ? totalPaid - order.total : 0;

  // Auto-fill amount with remaining amount when payment method is selected
  useEffect(() => {
    if (paymentMethod && remainingAmount > 0 && !amount) {
      setAmount(remainingAmount.toFixed(2));
    }
  }, [paymentMethod, remainingAmount, amount]);

  // Prevent payment processing for already paid orders
  if (order.paid) {
    return (
      <div className="h-full overflow-auto p-4 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
          <h2 className="text-2xl font-bold">Payment - {order.orderNumber}</h2>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800 mb-2">Order Already Paid</h3>
            <p className="text-muted-foreground">
              This order has already been paid for. No further payments can be processed.
            </p>
            <Button onClick={onBack} className="mt-4">
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
      toast.error('Payment amount does not cover the full order total.');
      return;
    }

    // Convert to OrderPayment format
    const orderPayments: OrderPayment[] = payments.map(payment => {
      const paymentObj: OrderPayment = {
        id: payment.id,
        organizationId: order.organizationId,
        orderId: order.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentDate: new Date(),
        createdAt: new Date(),
      };

      // Only include optional fields if they have values
      if (payment.reference && payment.reference.trim()) {
        paymentObj.reference = payment.reference.trim();
      }
      if (payment.notes && payment.notes.trim()) {
        paymentObj.notes = payment.notes.trim();
      }

      return paymentObj;
    });

    onPaymentProcessed(orderPayments);
    setPaymentProcessed(true);
  };



  return (
    <div className="h-full overflow-auto p-4 bg-background ">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
        <h2 className="text-2xl font-bold">Process Payment - {order.orderNumber}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <OrderSummaryCard
          order={order}
          payments={[]}
          showPaymentStatus={false}
          showOrderDetails={true}
          totalPaid={totalPaid}
          remainingAmount={remainingAmount}
          changeDue={changeDue}
        />

        {/* Payment Entry */}
        <PaymentEntryForm
          paymentTypes={paymentTypes}
          remainingAmount={remainingAmount}
          onAddPayment={addPayment}
          disabled={paymentProcessed}
          amount={amount}
          paymentMethod={paymentMethod}
          reference={reference}
          notes={notes}
          onAmountChange={setAmount}
          onPaymentMethodChange={setPaymentMethod}
          onReferenceChange={setReference}
          onNotesChange={setNotes}
        />
      </div>

      {/* Payment Status Indicator */}
      <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-primary">Payment Progress</h3>
            <p className="text-sm text-primary/80 mt-1">
              ${totalPaid.toFixed(2)} of ${order.total.toFixed(2)} paid
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {remainingAmount > 0 ? `$${remainingAmount.toFixed(2)}` : 'Paid'}
            </div>
            <div className="text-sm text-primary/80">
              {remainingAmount > 0 ? 'remaining' : 'in full'}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-primary/20 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((totalPaid / order.total) * 100, 100)}%` }}
          ></div>
        </div>
      </div>

        {/* Payment List */}
        {payments.length > 0 && (
          <PaymentList
            payments={payments.map(payment => ({
              ...payment,
              paymentDate: new Date() // Add current date for new payments
            }))}
            orderTotal={order.total}
            onRemovePayment={removePayment}
            showRemoveButton={true}
            disabled={paymentProcessed}
            className={`mt-6 ${paymentProcessed ? 'opacity-50' : ''}`}
          />
        )}

       {/* Process Payment Button or Completion Options */}
       <div className="mt-6 pb-6">
         {!paymentProcessed ? (
           <div className="flex justify-end">
             <Button
               onClick={processPayment}
               disabled={totalPaid < order.total}
               size="lg"
               className="px-8"
             >
               <CreditCard className="h-5 w-5 mr-2" />
               {changeDue > 0 ? 'Process Payment & Give Change' : 'Process Payment'}
             </Button>
           </div>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">Payment Processed Successfully!</h3>
                    <p className="text-green-700 mt-1">
                      Total Paid: ${totalPaid.toFixed(2)}
                      {changeDue > 0 && ` • Change Due: $${changeDue.toFixed(2)}`}
                    </p>
                    <p className="text-green-700 mt-2 text-sm">
                      Order has been marked as paid. You can now complete it from the orders view.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button onClick={onBack} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Back to Orders
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
       </div>
    </div>
  );
}