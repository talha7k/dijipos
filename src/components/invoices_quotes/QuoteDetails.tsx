'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Quote, Organization, Customer } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface QuoteDetailsProps {
  quote: Quote;
  organization: Organization | null;
  customer?: Customer;
}

export function QuoteDetails({
  quote,
  organization,
  customer
}: QuoteDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Quote #{quote.id.slice(-8)}</h1>
          <Badge variant={
            quote.status === 'accepted' ? 'default' :
            quote.status === 'rejected' ? 'destructive' :
            'secondary'
          } className="mt-2 capitalize">
            {quote.status}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Quote Date</p>
          <p className="font-medium">{formatDate(quote.createdAt)}</p>
          {quote.validUntil && (
            <>
              <p className="text-sm text-gray-600 mt-2">Valid Until</p>
              <p className="font-medium">{formatDate(quote.validUntil)}</p>
            </>
          )}
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
            <CardTitle>Quote For</CardTitle>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div>
                <p className="font-semibold">{customer.name}</p>
                {customer.email && <p className="text-sm text-gray-600">{customer.email}</p>}
                {customer.address && <p className="text-sm text-gray-600">{customer.address}</p>}
                {customer.vatNumber && <p className="text-sm text-gray-600">VAT: {customer.vatNumber}</p>}
              </div>
            ) : (
              <div>
                <p className="font-semibold">{quote.clientName}</p>
                {quote.clientEmail && <p className="text-sm text-gray-600">{quote.clientEmail}</p>}
                {quote.clientAddress && <p className="text-sm text-gray-600">{quote.clientAddress}</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Items</CardTitle>
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
              {quote.items.map((item, index) => (
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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.taxAmount > 0 && (
              <div className="flex justify-between">
                <span>Tax ({quote.taxRate}%):</span>
                <span>{formatCurrency(quote.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}