'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalesInvoice, PurchaseInvoice, Payment, Organization, Customer, Supplier, PaymentType } from '@/types';
import { InvoiceStatus, PurchaseInvoiceStatus } from '@/types/enums';
import { CreditCard, Printer, Eye, Plus, Edit } from 'lucide-react';
import { AddInvoicePaymentDialog } from './AddInvoicePaymentDialog';
import { EditCustomerDialog } from './EditCustomerDialog';
import { getInvoicePayments } from '@/lib/firebase/firestore/invoices';

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
  onStatusChange?: (invoiceId: string, newStatus: string) => Promise<void>;
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
  onStatusChange,
  onAddPayment
}: InvoiceDetailsDialogProps) {
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [showEditCustomerDialog, setShowEditCustomerDialog] = useState(false);
  const [invoicePayments, setInvoicePayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Fetch payments when the dialog opens and invoice changes
  useEffect(() => {
    if (open && invoice) {
      fetchPayments();
    }
  }, [open, invoice?.id]);

  const fetchPayments = async () => {
    if (!invoice) return;
    
    try {
      setPaymentsLoading(true);
      const payments = await getInvoicePayments(invoice.id);
      setInvoicePayments(payments);
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Refresh payments after adding a new one
  const handleAddPayment = async (paymentData: {
    amount: number;
    paymentMethod: string;
    paymentDate: Date;
    reference?: string;
    notes?: string;
  }) => {
    if (onAddPayment && invoice) {
      await onAddPayment(invoice.id, paymentData);
      // Refresh payments after adding
      await fetchPayments();
    }
  };
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
                 <p className="text-muted-foreground">Invoice #{invoice.id.slice(-8)}</p>
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
              <div className="border border-border rounded-lg p-4 bg-card">
                <h3 className="font-semibold mb-2">Invoice Information</h3>
                 <div className="space-y-1 text-sm">
                   <div className="flex justify-between">
                     <span className="text-muted-foreground">Status:</span>
                     {onStatusChange ? (
                       <Select
                         value={invoice.status}
                         onValueChange={(value) => onStatusChange(invoice.id, value)}
                       >
                         <SelectTrigger className="w-32 h-6 text-xs">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {(isPurchaseInvoice(invoice)
                             ? Object.values(PurchaseInvoiceStatus)
                             : Object.values(InvoiceStatus)
                           ).map((status) => (
                             <SelectItem key={status} value={status}>
                               {status.replace('_', ' ').toUpperCase()}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     ) : (
                       <Badge variant={
                         invoice.status === 'paid' ? 'default' :
                         invoice.status === 'overdue' ? 'destructive' :
                         'secondary'
                       } className="capitalize">
                         {invoice.status}
                       </Badge>
                     )}
                   </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoice Date:</span>
                      <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                    </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Due Date:</span>
                       <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                     </div>
                 </div>
               </div>
                <div className="border border-border rounded-lg p-4 bg-card">
                   <div className="flex items-center justify-between mb-2">
                     <h3 className="font-semibold">Client Information</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEditCustomerDialog(true)}
                      className="flex items-center gap-2"
                      title="Edit customer/supplier information"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                <div className="space-y-1 text-sm">
                  {isPurchaseInvoice(invoice) ? (
                    (() => {
                      const supplier = suppliers.find(s => s.id === (invoice as PurchaseInvoice).supplierId);
                      return supplier ? (
                        <>
                           <div className="flex justify-between">
                             <span className="text-muted-foreground">Supplier:</span>
                             <span>{supplier.name}</span>
                           </div>
                           {supplier.email && (
                             <div className="flex justify-between">
                               <span className="text-muted-foreground">Email:</span>
                               <span>{supplier.email}</span>
                             </div>
                           )}
                           {supplier.address && (
                             <div className="flex justify-between">
                               <span className="text-muted-foreground">Address:</span>
                               <span>{supplier.address}</span>
                             </div>
                           )}
                        </>
                      ) : (
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Supplier:</span>
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
                             <span className="text-muted-foreground">Customer:</span>
                             <span>{customer.name}</span>
                           </div>
                           {customer.email && (
                             <div className="flex justify-between">
                               <span className="text-muted-foreground">Email:</span>
                               <span>{customer.email}</span>
                             </div>
                           )}
                           {customer.address && (
                             <div className="flex justify-between">
                               <span className="text-muted-foreground">Address:</span>
                               <span>{customer.address}</span>
                             </div>
                           )}
                        </>
                      ) : (
                         <div className="flex justify-between">
                           <span className="text-muted-foreground">Customer:</span>
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
               <div className="border border-border rounded-lg p-4 bg-card">
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
                <div id="payments-section" className="border border-border rounded-lg p-4 bg-card">
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

                   {paymentsLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Loading payments...</p>
                      </div>
                   ) : invoicePayments.length > 0 ? (
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
                            {invoicePayments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{payment.paymentMethod}</p>
                                     {payment.notes && (
                                       <p className="text-sm text-muted-foreground">{payment.notes}</p>
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
                               <span className="text-muted-foreground">Total Paid:</span>
                               <span className="font-medium">${invoicePayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
                             </div>
                             {invoicePayments.reduce((sum, p) => sum + p.amount, 0) < invoice.total && (
                               <div className="flex justify-between">
                                 <span className="text-muted-foreground">Remaining Balance:</span>
                                 <span className="font-medium text-destructive">${(invoice.total - invoicePayments.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                     ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">No payments recorded for this invoice</p>
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
            onAddPayment={handleAddPayment}
            paymentTypes={paymentTypes}
            remainingAmount={invoice.total - invoicePayments.reduce((sum, p) => sum + p.amount, 0)}
            invoiceId={invoice.id}
          />
        )}

        {/* Edit Customer/Supplier Dialog */}
        {invoice && (
          <EditCustomerDialog
            invoice={invoice}
            open={showEditCustomerDialog}
            onOpenChange={setShowEditCustomerDialog}
            onUpdate={(updatedInvoice) => {
              // For now, we'll just log the update. In a real implementation,
              // this would call an update function passed from the parent
              console.log('Updated invoice:', updatedInvoice);
              // You might want to call onEdit(updatedInvoice) or a specific update function
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}