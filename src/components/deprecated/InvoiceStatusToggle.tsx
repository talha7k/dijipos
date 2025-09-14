'use client';

import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Invoice, InvoiceStatus } from '@/types';
import { toast } from 'sonner';

interface InvoiceStatusToggleProps {
  invoice: Invoice;
  onStatusChange?: (invoiceId: string, newStatus: Invoice['status']) => void;
}

export function InvoiceStatusToggle({ invoice, onStatusChange }: InvoiceStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Invoice['status']) => {
    if (!invoice.organizationId) return;

    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'organizations', invoice.organizationId, 'invoices', invoice.id), {
        status: newStatus,
        updatedAt: new Date(),
      });

      toast.success(`Invoice marked as ${newStatus}`);
      onStatusChange?.(invoice.id, newStatus);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case InvoiceStatus.SENT:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case InvoiceStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getNextStatus = () => {
    switch (invoice.status) {
      case InvoiceStatus.DRAFT:
        return InvoiceStatus.SENT;
      case InvoiceStatus.SENT:
        return InvoiceStatus.PAID;
      case InvoiceStatus.PAID:
        return InvoiceStatus.SENT;
      default:
        return InvoiceStatus.DRAFT;
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.SENT:
        return 'Sent';
      case InvoiceStatus.DRAFT:
        return 'Draft';
      default:
        return status;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleStatusChange(getNextStatus())}
      disabled={isUpdating}
      className={getStatusColor(invoice.status)}
    >
      {isUpdating ? 'Updating...' : getStatusLabel(invoice.status)}
    </Button>
  );
}