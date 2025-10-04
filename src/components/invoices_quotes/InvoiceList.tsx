'use client';

import { Badge } from '@/components/ui/badge';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SalesInvoice, PurchaseInvoice, Customer, Supplier, Payment, Organization, InvoiceTemplate, DocumentPrintSettings } from '@/types';
import { Receipt } from 'lucide-react';

import { InvoiceActions } from './InvoiceActions';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: SalesInvoice | PurchaseInvoice): invoice is PurchaseInvoice {
  return invoice.type === 'purchase';
}

interface InvoiceListProps {
   invoices: (SalesInvoice | PurchaseInvoice)[];
   customers: Customer[];
   suppliers: Supplier[];
   payments: { [invoiceId: string]: Payment[] };
   onInvoiceClick: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onViewDetails: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onStatusChange: (invoiceId: string, status: (SalesInvoice | PurchaseInvoice)['status']) => void;
   onEdit?: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onDuplicate?: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onSend?: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onEmail?: (invoice: SalesInvoice | PurchaseInvoice, templateId: string) => void;
   onDownloadPDF?: (invoice: SalesInvoice | PurchaseInvoice) => void;
   onDelete?: (invoice: SalesInvoice | PurchaseInvoice) => void;
   organization: Organization | null;
   invoiceTemplates: InvoiceTemplate[];
   settings?: DocumentPrintSettings | null;
 }

export function InvoiceList({
   invoices,
   customers,
   suppliers,
   payments,
   onInvoiceClick,
   onViewDetails,
   onStatusChange,
   onEdit,
   onDuplicate,
   onSend,
   onEmail,
   onDownloadPDF,
   onDelete,
   organization,
   invoiceTemplates,
   settings,
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
              <TableCell>
                {isPurchaseInvoice(invoice) ? (
                  (() => {
                    const supplier = suppliers.find(s => s.id === (invoice as PurchaseInvoice).supplierId);
                    return supplier ? supplier.name : 'Supplier not found';
                  })()
                ) : (
                  (() => {
                    const customer = customers.find(c => c.name === (invoice as SalesInvoice).clientName);
                    return customer ? customer.name : 'Customer not found';
                  })()
                )}
              </TableCell>
              <TableCell>{isPurchaseInvoice(invoice) ? invoice.invoiceNumber || invoice.id.slice(-8) : invoice.id.slice(-8)}</TableCell>
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
              <TableCell>
                {(() => {
                  if (!invoice.dueDate) return 'N/A';
                  const date = typeof invoice.dueDate === 'string' ? new Date(invoice.dueDate) : invoice.dueDate;
                  return date instanceof Date && !isNaN(date.getTime()) 
                    ? date.toLocaleDateString() 
                    : 'N/A';
                })()}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                    <InvoiceActions
                      invoice={invoice}
                      payments={payments[invoice.id] || []}
                      onViewDetails={onViewDetails}
                      onStatusChange={onStatusChange}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onSend={onSend}
                      onEmail={onEmail}
                      onDownloadPDF={onDownloadPDF}
                      onDelete={onDelete}
                      organization={organization}
                      invoiceTemplates={invoiceTemplates}
                      customers={customers}
                      suppliers={suppliers}
                      settings={settings}
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