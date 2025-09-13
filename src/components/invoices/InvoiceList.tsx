'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice, Customer, Supplier, Payment } from '@/types';
import { Receipt } from 'lucide-react';
import { InvoiceStatusToggle } from './InvoiceStatusToggle';
import { InvoiceActions } from './InvoiceActions';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  suppliers: Supplier[];
  payments: { [invoiceId: string]: Payment[] };
  onInvoiceClick: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onViewDetails: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
  onEdit?: (invoice: Invoice) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownloadPDF?: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  customers,
  suppliers,
  payments,
  onInvoiceClick,
  onPrint,
  onViewDetails,
  onStatusChange,
  onEdit,
  onDuplicate,
  onSend,
  onDownloadPDF
}: InvoiceListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Invoice #</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onInvoiceClick(invoice)}
            >
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>${invoice.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'overdue' ? 'destructive' :
                  'secondary'
                }>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{invoice.dueDate?.toLocaleDateString()}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                   <InvoiceActions
                     invoice={invoice}
                     payments={payments[invoice.id] || []}
                     onPrint={onPrint}
                     onViewDetails={onViewDetails}
                     onStatusChange={onStatusChange}
                     onEdit={onEdit}
                     onDuplicate={onDuplicate}
                     onSend={onSend}
                     onDownloadPDF={onDownloadPDF}
                   />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center">
                  <Receipt className="h-12 w-12 mb-4 text-gray-400" />
                  <p>No invoices found. Create your first invoice to get started.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}