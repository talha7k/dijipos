'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SalesInvoice, PurchaseInvoice, Payment, Organization, Customer, Supplier } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

// Type guard to check if invoice is a PurchaseInvoice
function isPurchaseInvoice(invoice: SalesInvoice | PurchaseInvoice): invoice is PurchaseInvoice {
  return invoice.type === 'purchase';
}

interface InvoiceDetailsProps {
  invoice: SalesInvoice | PurchaseInvoice;
  organization: Organization | null;
  customer?: Customer;
  supplier?: Supplier;
  payments?: Payment[];
  onStatusChange?: (invoiceId: string, status: (SalesInvoice | PurchaseInvoice)['status']) => void;
}

export function InvoiceDetails({
  invoice,
  organization,
  customer,
  supplier,
  payments = [],
  onStatusChange
}: InvoiceDetailsProps) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = invoice.total - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Invoice #{isPurchaseInvoice(invoice) ? invoice.invoiceNumber || invoice.id.slice(-8) : invoice.id.slice(-8)}</h1>
          <div className="mt-2">
            <Select
              value={invoice.status}
              onValueChange={(value: (SalesInvoice | PurchaseInvoice)['status']) => onStatusChange?.(invoice.id, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Invoice Date</p>
          <p className="font-medium">{formatDate(invoice.createdAt)}</p>
          <p className="text-sm text-gray-600 mt-2">Due Date</p>
          <p className="font-medium">{formatDate(invoice.dueDate)}</p>
        </div>
      </div>

      {/* Organization & Client Info */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent>
            {organization ? (
              <div>
                <p className="font-semibold">{organization.name}</p>
                <p className="text-sm text-gray-600">{organization.address}</p>
                {organization.phone && <p className="text-sm text-gray-600">{organization.phone}</p>}
                {organization.email && <p className="text-sm text-gray-600">{organization.email}</p>}
                {organization.vatNumber && <p className="text-sm text-gray-600">VAT: {organization.vatNumber}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Organization information not available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            {isPurchaseInvoice(invoice) ? (
              supplier ? (
                <div>
                  <p className="font-semibold">{supplier.name}</p>
                  {supplier.email && <p className="text-sm text-gray-600">{supplier.email}</p>}
                  {supplier.address && <p className="text-sm text-gray-600">{supplier.address}</p>}
                  {supplier.vatNumber && <p className="text-sm text-gray-600">VAT: {supplier.vatNumber}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Supplier information not available</p>
              )
            ) : (
              customer ? (
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                  {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
                  {customer.vatNumber && <p className="text-sm text-gray-600">VAT: {customer.vatNumber}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Customer information not available</p>
              )
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
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
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary & Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              {remainingBalance > 0 && (
                <div className="flex justify-between font-bold text-red-600">
                  <span>Remaining:</span>
                  <span>{formatCurrency(remainingBalance)}</span>
                </div>
              )}
            </div>
            
            {payments.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Payment History</h4>
                <div className="space-y-2">
                  {payments.map((payment, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <span>{payment.paymentMethod}</span>
                        <span className="text-gray-600 ml-2">({formatDate(payment.paymentDate)})</span>
                      </div>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}