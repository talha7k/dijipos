'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, DollarSign } from 'lucide-react';
import { PaymentType } from '@/types';
import { toast } from 'sonner';

interface AddInvoicePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPayment: (paymentData: {
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
  paymentTypes: PaymentType[];
  remainingAmount: number;
  invoiceId: string;
}

export function AddInvoicePaymentDialog({
  open,
  onOpenChange,
  onAddPayment,
  paymentTypes,
  remainingAmount,
  invoiceId
}: AddInvoicePaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill amount with remaining amount when payment method is selected
  useEffect(() => {
    if (paymentMethod && remainingAmount > 0 && !amount) {
      setAmount(remainingAmount.toFixed(2));
    }
  }, [paymentMethod, remainingAmount, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    if (paymentAmount > remainingAmount) {
      toast.error('Payment amount cannot exceed remaining balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddPayment({
        amount: paymentAmount,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        reference: reference || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReference('');
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setPaymentMethod('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReference('');
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Add Payment to Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder={remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isSubmitting}
            />
            {remainingAmount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Remaining balance: ${remainingAmount.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              disabled={isSubmitting}
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
            <Label htmlFor="paymentDate">Payment Date *</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Input
              id="reference"
              placeholder="Receipt #, Transaction ID, etc."
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || !paymentMethod || isSubmitting}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}