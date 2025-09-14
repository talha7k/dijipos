'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice, InvoiceStatus } from '@/types';
import { Receipt, MoreHorizontal } from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  onInvoiceClick: (invoice: Invoice) => void;
  onPrintPreview: (invoice: Invoice) => void;
  onActionsClick: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, status: Invoice['status']) => void;
  updatingStatus: string | null;
}

export function InvoiceTable({
  invoices,
  onInvoiceClick,
  onPrintPreview,
  onActionsClick,
  onStatusChange,
  updatingStatus
}: InvoiceTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
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
            onClick={() => {
              console.log('Invoice clicked:', invoice.id);
              onInvoiceClick(invoice);
            }}
          >
            <TableCell>{invoice.clientName}</TableCell>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionsClick(invoice);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4 mr-1" />
                    Actions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintPreview(invoice);
                    }}
                  >
                    Print Preview
                  </Button>
                 {invoice.status === 'draft' && (
                   <Button
                     variant="outline"
                     size="sm"
                     loading={updatingStatus === invoice.id}
                     onClick={(e) => {
                       e.stopPropagation();
                        onStatusChange(invoice.id, InvoiceStatus.SENT);
                     }}
                   >
                     Mark as Sent
                   </Button>
                 )}
                 {invoice.status === 'sent' && (
                   <Button
                     variant="outline"
                     size="sm"
                     loading={updatingStatus === invoice.id}
                     onClick={(e) => {
                       e.stopPropagation();
                        onStatusChange(invoice.id, InvoiceStatus.PAID);
                     }}
                   >
                     Mark as Paid
                   </Button>
                 )}
               </div>
             </TableCell>
          </TableRow>
        ))}
        {invoices.length === 0 && (
           <TableRow>
             <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
               <div className="flex flex-col items-center">
                 <Receipt className="h-12 w-12 mb-4 text-gray-400" />
                 <p>No invoices found. Create your first invoice to get started.</p>
               </div>
             </TableCell>
           </TableRow>
         )}
      </TableBody>
    </Table>
  );
}