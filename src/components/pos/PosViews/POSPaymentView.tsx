"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { ArrowLeft, CreditCard } from "lucide-react";
import { Order, OrderPayment, PaymentType, PaymentStatus } from "@/types";
import { toast } from "sonner";
import { OrderSummaryCard } from "../OrderSummaryCard";
import { PaymentList } from "../PaymentList";
import { PaymentEntryForm } from "../PaymentEntryForm";
import { OrderAlreadyPaid } from "../OrderAlreadyPaid";
import { useCurrency } from "@/lib/hooks/useCurrency";

interface POSPaymentGridProps {
  order: Order;
  paymentTypes: PaymentType[];
  onPaymentProcessed: (payments: OrderPayment[]) => Promise<void>;
  onBack: () => void;
}

interface PaymentEntry {
  id: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}
export function POSPaymentGrid({
  order,
  paymentTypes,
  onPaymentProcessed,
  onBack,
}: POSPaymentGridProps) {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  const { formatCurrency } = useCurrency();
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
  const paymentStatus = order.paymentStatus || PaymentStatus.UNPAID;
  if (paymentStatus === PaymentStatus.PAID) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center gap-4 p-4 border-b">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
          <h2 className="text-2xl font-bold">Payment - {order.orderNumber}</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <OrderAlreadyPaid orderNumber={order.orderNumber} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <OrderSummaryCard
              order={order}
              payments={[]}
              showPaymentStatus={false}
              showOrderDetails={true}
            />
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
      reference: reference || '',
      notes: notes || '',
    };

    setPayments([...payments, newPayment]);
    setAmount("");
    setReference("");
    setNotes("");
    setPaymentMethod("");
  };

  const removePayment = (paymentId: string) => {
    setPayments(payments.filter((p) => p.id !== paymentId));
  };

  const processPayment = async () => {
    if (totalPaid < order.total) {
      toast.error("Payment amount does not cover the full order total.");
      return;
    }

    // Convert to OrderPayment format
    const orderPayments: OrderPayment[] = payments.map((payment) => {
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

    try {
      await onPaymentProcessed(orderPayments);
      setPaymentProcessed(true);
    } catch (error) {
      console.error("Payment processing failed:", error);
      toast.error("Failed to process payment. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>
        <h2 className="text-2xl font-bold">
          Process Payment - {order.orderNumber}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Payment Status Indicator - Moved to top for better visibility */}
        <div
          className={`mb-6 p-4 rounded-lg border ${
            remainingAmount > 0
              ? "bg-destructive/10 border-destructive/20"
              : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`text-sm font-medium ${
                  remainingAmount > 0
                    ? "text-destructive"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                Payment Progress
              </h3>
              <p
                className={`text-sm mt-1 ${
                  remainingAmount > 0
                    ? "text-destructive/80"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {formatCurrency(totalPaid)} of {formatCurrency(order.total)}{" "}
                paid
              </p>
              {remainingAmount > 0 && (
                <p className="text-sm text-destructive/90 mt-1 font-medium">
                  Add {formatCurrency(remainingAmount)} more to process payment
                </p>
              )}
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${
                  remainingAmount > 0
                    ? "text-destructive"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {remainingAmount > 0 ? formatCurrency(remainingAmount) : "Paid"}
              </div>
              <div
                className={`text-sm ${
                  remainingAmount > 0
                    ? "text-destructive/80"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {remainingAmount > 0 ? "remaining" : "in full"}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                remainingAmount > 0 ? "bg-destructive" : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min((totalPaid / order.total) * 100, 100)}%`,
              }}
            ></div>
          </div>
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

        {/* Payment List */}
        {payments.length > 0 && (
          <PaymentList
            payments={payments.map((payment) => ({
              ...payment,
              paymentDate: new Date(), // Add current date for new payments
            }))}
            orderTotal={order.total}
            onRemovePayment={removePayment}
            showRemoveButton={true}
            disabled={paymentProcessed}
            className={`mt-6 ${paymentProcessed ? "opacity-50" : ""}`}
          />
        )}

        {/* Process Payment Button or Completion Options */}
        <div className="mt-6">
          {!paymentProcessed ? (
            <div className="flex justify-end">
              <Button
                onClick={processPayment}
                disabled={totalPaid < order.total}
                size="lg"
                className="px-8"
                title={
                  totalPaid < order.total
                    ? `Add ${formatCurrency(order.total - totalPaid)} more to process payment`
                    : undefined
                }
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {totalPaid < order.total
                  ? `Add ${formatCurrency(order.total - totalPaid)} More`
                  : changeDue > 0
                    ? "Process Payment & Give Change"
                    : "Process Payment"}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-green-600 font-medium">
                Payment processed successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
