'use client';

import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Invoice } from '@/types';
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
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getNextStatus = () => {
    switch (invoice.status) {
      case 'draft':
        return 'sent';
      case 'sent':
        return 'paid';
      case 'paid':
        return 'sent';
      default:
        return 'draft';
    }
  };

  const getStatusLabel = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'sent':
        return 'Sent';
      case 'draft':
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