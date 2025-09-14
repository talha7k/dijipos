'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign } from 'lucide-react';
import { PaymentType } from '@/types';

interface PaymentEntry {
  id: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

interface PaymentEntryFormProps {
  paymentTypes: PaymentType[];
  remainingAmount: number;
  onAddPayment: (payment: PaymentEntry) => void;
  disabled?: boolean;
  className?: string;
  // Optional external state management
  amount?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  onAmountChange?: (value: string) => void;
  onPaymentMethodChange?: (value: string) => void;
  onReferenceChange?: (value: string) => void;
  onNotesChange?: (value: string) => void;
}

export function PaymentEntryForm({
  paymentTypes,
  remainingAmount,
  onAddPayment,
  disabled = false,
  className = '',
  amount: externalAmount,
  paymentMethod: externalPaymentMethod,
  reference: externalReference,
  notes: externalNotes,
  onAmountChange,
  onPaymentMethodChange,
  onReferenceChange,
  onNotesChange
}: PaymentEntryFormProps) {
  // Use external state if provided, otherwise use internal state
  const [internalAmount, setInternalAmount] = useState('');
  const [internalPaymentMethod, setInternalPaymentMethod] = useState('');
  const [internalReference, setInternalReference] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const amount = externalAmount !== undefined ? externalAmount : internalAmount;
  const paymentMethod = externalPaymentMethod !== undefined ? externalPaymentMethod : internalPaymentMethod;
  const reference = externalReference !== undefined ? externalReference : internalReference;
  const notes = externalNotes !== undefined ? externalNotes : internalNotes;

  const handleAmountChange = (value: string) => {
    if (onAmountChange) onAmountChange(value);
    else setInternalAmount(value);
  };

  const handlePaymentMethodChange = (value: string) => {
    if (onPaymentMethodChange) onPaymentMethodChange(value);
    else setInternalPaymentMethod(value);
  };

  const handleReferenceChange = (value: string) => {
    if (onReferenceChange) onReferenceChange(value);
    else setInternalReference(value);
  };

  const handleNotesChange = (value: string) => {
    if (onNotesChange) onNotesChange(value);
    else setInternalNotes(value);
  };

  // Auto-fill amount with remaining amount when payment method is selected
  useEffect(() => {
    if (paymentMethod && remainingAmount > 0 && !amount) {
      if (onAmountChange) {
        onAmountChange(remainingAmount.toFixed(2));
      } else {
        setInternalAmount(remainingAmount.toFixed(2));
      }
    }
  }, [paymentMethod, remainingAmount, amount, onAmountChange]);

  const handleAddPayment = () => {
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

    onAddPayment(newPayment);

    // Reset form if using internal state
    if (!onAmountChange) setInternalAmount('');
    if (!onReferenceChange) setInternalReference('');
    if (!onNotesChange) setInternalNotes('');
    if (!onPaymentMethodChange) setInternalPaymentMethod('');
  };

  return (
    <Card className={`${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
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
                onChange={(e) => handleAmountChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select
            value={paymentMethod}
            onValueChange={handlePaymentMethodChange}
            disabled={disabled}
          >
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
            onChange={(e) => handleReferenceChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            placeholder="Additional notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={disabled}
          />
        </div>

        <Button
          onClick={handleAddPayment}
          className="w-full"
          disabled={!amount || !paymentMethod || disabled}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Add Payment
        </Button>
      </CardContent>
    </Card>
  );
}