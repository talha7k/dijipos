import React from 'react';
import { Invoice, Organization, Customer, Supplier, Payment } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard } from 'lucide-react';

interface InvoiceDetailsProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  organization: Organization | null;
  customers: Customer[];
  suppliers: Supplier[];
  payments: { [invoiceId: string]: Payment[] };
}

export function InvoiceDetails({ invoice, open, onClose, organization, customers, suppliers, payments }: InvoiceDetailsProps) {
  if (!invoice || !organization) return null;

  const customer = customers.find(c => c.name === invoice.clientName);
  const supplier = suppliers.find(s => s.id === invoice.supplierId);
  const invoicePayments = payments[invoice.id] || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Invoice Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' :
                      'secondary'
                    }
                    className="capitalize"
                  >
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice Date:</span>
                  <span>{invoice.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span>{invoice.dueDate?.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Client Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Client:</span>
                  <span>{invoice.clientName}</span>
                </div>
                {invoice.clientEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{invoice.clientEmail}</span>
                  </div>
                )}
                {invoice.clientAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span>{invoice.clientAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div>
            <h3 className="font-semibold mb-3">Invoice Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Invoice Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Invoice Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>${invoice.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information Accordion */}
            <div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payments">
                  <AccordionTrigger className="font-semibold">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payments Made
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {invoicePayments.length > 0 ? (
                      <div className="space-y-2">
                        {invoicePayments.map((payment, index) => (
                          <div key={index} className="flex justify-between text-sm border-b pb-2">
                            <div>
                              <p className="font-medium">{payment.paymentMethod}</p>
                              <p className="text-gray-600">{payment.paymentDate.toLocaleDateString()}</p>
                              {payment.reference && (
                                <p className="text-gray-500 text-xs">Ref: {payment.reference}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${payment.amount.toFixed(2)}</p>
                              {payment.notes && (
                                <p className="text-gray-500 text-xs">{payment.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Total Paid:</span>
                          <span>${invoicePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                        </div>
                        {invoicePayments.reduce((sum, p) => sum + p.amount, 0) < invoice.total && (
                          <div className="flex justify-between text-orange-600">
                            <span>Remaining Balance:</span>
                            <span>${(invoice.total - invoicePayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No payments recorded for this invoice</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {invoice.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}