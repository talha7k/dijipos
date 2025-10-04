'use client';

import { Button } from '@/components/ui/button';
import { SalesInvoice, PurchaseInvoice, InvoiceStatus } from '@/types';

interface InvoiceStatusToggleProps {
  invoice: SalesInvoice | PurchaseInvoice;
  onStatusChange: (invoiceId: string, status: (SalesInvoice | PurchaseInvoice)['status']) => void;
  updatingStatus: string | null;
}

export function InvoiceStatusToggle({ 
  invoice, 
  onStatusChange, 
  updatingStatus 
}: InvoiceStatusToggleProps) {
  const getNextStatus = (currentStatus: (SalesInvoice | PurchaseInvoice)['status']): (SalesInvoice | PurchaseInvoice)['status'] | null => {
    switch (currentStatus) {
      case InvoiceStatus.DRAFT:
        return InvoiceStatus.QUOTE;
      case InvoiceStatus.QUOTE:
        return InvoiceStatus.SENT;
      case InvoiceStatus.SENT:
        return InvoiceStatus.WAITING_PAYMENT;
      case InvoiceStatus.WAITING_PAYMENT:
        return InvoiceStatus.PARTIALLY_PAID;
      case InvoiceStatus.PARTIALLY_PAID:
        return InvoiceStatus.PAID;
      case InvoiceStatus.OVERDUE:
        return InvoiceStatus.PAID;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: (SalesInvoice | PurchaseInvoice)['status']) => {
    const labels: Record<(SalesInvoice | PurchaseInvoice)['status'], { current: string; next: string }> = {
      draft: { current: 'Draft', next: 'Create Quote' },
      quote: { current: 'Quote', next: 'Send' },
      sent: { current: 'Sent', next: 'Mark Waiting Payment' },
      waiting_payment: { current: 'Waiting Payment', next: 'Mark Partially Paid' },
      partially_paid: { current: 'Partially Paid', next: 'Mark Paid' },
      paid: { current: 'Paid', next: '' },
      overdue: { current: 'Overdue', next: 'Mark Paid' },
      cancelled: { current: 'Cancelled', next: '' },
      received: { current: 'Received', next: 'Mark Paid' },
    };
    return labels[status];
  };

  const nextStatus = getNextStatus(invoice.status);
  
  if (!nextStatus) {
    return (
      <span className="text-sm font-medium text-green-600">
        {invoice.status}
      </span>
    );
  }

  const statusLabel = getStatusLabel(invoice.status);

  return (
    <Button
      variant="outline"
      size="sm"
      loading={updatingStatus === invoice.id}
      onClick={(e) => {
        e.stopPropagation();
        onStatusChange(invoice.id, nextStatus);
      }}
    >
      {statusLabel.next}
    </Button>
  );
}