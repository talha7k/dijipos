'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Invoice, Payment, Organization, Customer, Supplier } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceDetailsProps {
  invoice: Invoice;
  organization: Organization | null;
  customer?: Customer;
  supplier?: Supplier;
  payments?: Payment[];
}

export function InvoiceDetails({ 
  invoice, 
  organization, 
  customer, 
  supplier, 
  payments = [] 
}: InvoiceDetailsProps) {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = invoice.total - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
          <Badge variant={
            invoice.status === 'paid' ? 'default' :
            invoice.status === 'overdue' ? 'destructive' :
            'secondary'
          } className="mt-2 capitalize">
            {invoice.status}
          </Badge>
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
            <p className="font-semibold">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-sm text-gray-600">{invoice.clientEmail}</p>}
            {invoice.clientAddress && <p className="text-sm text-gray-600">{invoice.clientAddress}</p>}
            {invoice.clientVAT && <p className="text-sm text-gray-600">VAT: {invoice.clientVAT}</p>}
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