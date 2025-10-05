'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SalesInvoice, PurchaseInvoice, Payment, Organization, Customer, Supplier, PaymentType } from '@/types';
import { CreditCard, Printer, Eye, Plus, Edit } from 'lucide-react';
import { AddInvoicePaymentDialog } from './AddInvoicePaymentDialog';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: SalesInvoice | PurchaseInvoice): invoice is PurchaseInvoice {
  return invoice.type === 'purchase';
}



interface InvoiceDetailsDialogProps {
  invoice: SalesInvoice | PurchaseInvoice | null;
  customers: Customer[];
  suppliers: Supplier[];
  payments: { [invoiceId: string]: Payment[] };
  paymentTypes: PaymentType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrint?: () => void;
  onEdit?: () => void;
  onAddPayment?: (invoiceId: string, paymentData: {
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    reference?: string;
    notes?: string;
  }) => Promise<void>;
}

export function InvoiceDetailsDialog({
  invoice,
  customers,
  suppliers,
  payments,
  paymentTypes,
  open,
  onOpenChange,
  onPrint,
  onEdit,
  onAddPayment
}: InvoiceDetailsDialogProps) {
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        {invoice ? (
          <div className="space-y-6">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            {/* Dialog Header with Print Button */}
             <div className="flex justify-between items-center border-b pb-4">
              <div>
                <p className="text-gray-600">Invoice #{invoice.id.slice(-8)}</p>
              </div>
               <div className="flex gap-2">
                 {onAddPayment && (
                   <Button
                     variant="default"
                     size="sm"
                     onClick={() => setShowAddPaymentDialog(true)}
                     className="flex items-center gap-2"
                   >
                     <Plus className="h-4 w-4" />
                     Add Payment
                   </Button>
                 )}
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
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={onEdit}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Invoice
                    </Button>
                  )}
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
                     <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Due Date:</span>
                     <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                   </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Client Information</h3>
                <div className="space-y-1 text-sm">
                  {isPurchaseInvoice(invoice) ? (
                    (() => {
                      const supplier = suppliers.find(s => s.id === (invoice as PurchaseInvoice).supplierId);
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
                      const customer = customers.find(c => c.name === (invoice as SalesInvoice).clientName);
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

               {/* Payment Information */}
               <div id="payments-section">
                 <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <h3 className="font-semibold flex items-center gap-2">
                       <CreditCard className="h-4 w-4" />
                       Payments Made
                     </h3>
                     {onAddPayment && (
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setShowAddPaymentDialog(true)}
                         className="flex items-center gap-2"
                       >
                         <Plus className="h-4 w-4" />
                         Add Payment
                       </Button>
                     )}
                   </div>

                   {payments[invoice.id] && payments[invoice.id].length > 0 ? (
                     <div className="space-y-4">
                       <Table>
                         <TableHeader>
                           <TableRow>
                             <TableHead>Payment Method</TableHead>
                             <TableHead>Date</TableHead>
                             <TableHead>Reference</TableHead>
                             <TableHead className="text-right">Amount</TableHead>
                           </TableRow>
                         </TableHeader>
                         <TableBody>
                           {payments[invoice.id].map((payment, index) => (
                             <TableRow key={index}>
                               <TableCell>
                                 <div>
                                   <p className="font-medium">{payment.paymentMethod}</p>
                                   {payment.notes && (
                                     <p className="text-sm text-gray-600">{payment.notes}</p>
                                   )}
                                 </div>
                               </TableCell>
                                <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                               <TableCell>{payment.reference || '-'}</TableCell>
                               <TableCell className="text-right font-medium">${payment.amount.toFixed(2)}</TableCell>
                             </TableRow>
                           ))}
                         </TableBody>
                       </Table>

                       <div className="flex justify-between items-center pt-4 border-t">
                         <div className="space-y-1">
                           <div className="flex justify-between">
                             <span className="text-gray-600">Total Paid:</span>
                             <span className="font-medium">${payments[invoice.id].reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                           </div>
                           {payments[invoice.id].reduce((sum, p) => sum + p.amount, 0) < invoice.total && (
                             <div className="flex justify-between">
                               <span className="text-gray-600">Remaining Balance:</span>
                               <span className="font-medium text-orange-600">${(invoice.total - payments[invoice.id].reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                       <p className="text-sm">No payments recorded for this invoice</p>
                       {onAddPayment && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setShowAddPaymentDialog(true)}
                           className="mt-4 flex items-center gap-2"
                         >
                           <Plus className="h-4 w-4" />
                           Add First Payment
                         </Button>
                       )}
                     </div>
                   )}
                 </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading invoice details...</p>
          </div>
        )}

        {/* Add Payment Dialog */}
        {invoice && onAddPayment && (
          <AddInvoicePaymentDialog
            open={showAddPaymentDialog}
            onOpenChange={setShowAddPaymentDialog}
            onAddPayment={(paymentData) => onAddPayment(invoice.id, paymentData)}
            paymentTypes={paymentTypes}
            remainingAmount={invoice.total - (payments[invoice.id]?.reduce((sum, p) => sum + p.amount, 0) || 0)}
            invoiceId={invoice.id}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}