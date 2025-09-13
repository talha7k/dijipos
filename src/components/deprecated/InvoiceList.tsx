import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice } from '@/types';
import { Eye, Printer } from 'lucide-react';
import { InvoiceStatusToggle } from './InvoiceStatusToggle';
import { InvoiceActions } from './InvoiceActions';

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onViewInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onStatusChange?: (invoiceId: string, newStatus: Invoice['status']) => void;
}

export function InvoiceList({ invoices, loading, onViewInvoice, onPrintInvoice, onStatusChange }: InvoiceListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8">
        <p>No invoices found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id.slice(-8)}</TableCell>
            <TableCell>{invoice.clientName}</TableCell>
            <TableCell>{invoice.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>{invoice.dueDate?.toLocaleDateString()}</TableCell>
            <TableCell>${invoice.total.toFixed(2)}</TableCell>
            <TableCell>
                <InvoiceStatusToggle
                  invoice={invoice}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
              <TableCell>
                <InvoiceActions
                  invoice={invoice}
                  onView={onViewInvoice}
                  onPrint={onPrintInvoice}
                />
              </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}