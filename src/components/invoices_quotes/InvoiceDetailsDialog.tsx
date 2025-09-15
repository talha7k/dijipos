'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice, Payment, Organization, Customer, Supplier } from '@/types';
import { CreditCard, Printer, Eye } from 'lucide-react';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: Invoice): invoice is Invoice & { type: 'purchase' } {
  return invoice.type === 'purchase';
}



interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  organization: Organization | null;
  customers: Customer[];
  suppliers: Supplier[];
  payments: { [invoiceId: string]: Payment[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint?: () => void;
}

export function InvoiceDetailsDialog({
  invoice,
  organization,
  customers,
  suppliers,
  payments,
  open,
  onOpenChange,
  onPrint
}: InvoiceDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        {invoice ? (
          <div className="space-y-6">
            {/* Dialog Header with Print Button */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold">Invoice Details</h2>
                <p className="text-gray-600">Invoice #{invoice.id.slice(-8)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Show payments section
                    const paymentsSection = document.getElementById('payments-section');
                    if (paymentsSection) {
                      paymentsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Payments
                </Button>
                {onPrint && (
                  <Button
                    onClick={onPrint}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print PDF
                  </Button>
                )}
              </div>
            </div>

            {/* Invoice Header Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Invoice Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' :
                      'secondary'
                    } className="capitalize">
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
                  {isPurchaseInvoice(invoice) ? (
                    (() => {
                      const supplier = suppliers.find(s => s.id === (invoice as Invoice & { supplierId?: string }).supplierId);
                      return supplier ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Supplier:</span>
                            <span>{supplier.name}</span>
                          </div>
                          {supplier.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span>{supplier.email}</span>
                            </div>
                          )}
                          {supplier.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Address:</span>
                              <span>{supplier.address}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span>Supplier not found</span>
                        </div>
                      );
                    })()
                  ) : (
                    (() => {
                      const customer = customers.find(c => c.id === (invoice as Invoice & { customerId?: string }).customerId);
                      return customer ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer:</span>
                            <span>{customer.name}</span>
                          </div>
                          {customer.email && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span>{customer.email}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Address:</span>
                              <span>{customer.address}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span>Customer not found</span>
                        </div>
                      );
                    })()
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
              <div id="payments-section">
                <Accordion type="single" collapsible className="w-full" defaultValue="payments">
                  <AccordionItem value="payments">
                    <AccordionTrigger className="font-semibold">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payments Made
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {payments[invoice.id] && payments[invoice.id].length > 0 ? (
                        <div className="space-y-2">
                          {payments[invoice.id].map((payment, index) => (
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
                            <span>${payments[invoice.id].reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                          </div>
                          {payments[invoice.id].reduce((sum, p) => sum + p.amount, 0) < invoice.total && (
                            <div className="flex justify-between text-orange-600">
                              <span>Remaining Balance:</span>
                              <span>${(invoice.total - payments[invoice.id].reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
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
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading invoice details...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}