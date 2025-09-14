'use client';

import { Invoice, Payment, Organization, Customer, Supplier } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useRef, useEffect } from 'react';

interface InvoicePrintProps {
  invoice: Invoice;
  organization: Organization | null;
  customer?: Customer;
  supplier?: Supplier;
  payments?: Payment[];
}

export function InvoicePrint({ 
  invoice, 
  organization, 
  customer, 
  supplier, 
  payments = [] 
}: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (printRef.current) {
      // Trigger print when component mounts
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, []);

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = invoice.total - totalPaid;

  return (
    <div ref={printRef} className="p-8 bg-white print:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {organization && (
              <div>
                <h1 className="text-2xl font-bold">{organization.name}</h1>
                <p className="text-sm">{organization.address}</p>
                {organization.phone && <p className="text-sm">{organization.phone}</p>}
                {organization.email && <p className="text-sm">{organization.email}</p>}
                {organization.vatNumber && <p className="text-sm">VAT: {organization.vatNumber}</p>}
              </div>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold">INVOICE</h2>
            <p className="text-lg font-medium">#{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice & Client Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <div className="text-sm">
              <p className="font-medium">{invoice.clientName}</p>
              {invoice.clientEmail && <p>{invoice.clientEmail}</p>}
              {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
              {invoice.clientVAT && <p>VAT: {invoice.clientVAT}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Invoice Date:</span> {formatDate(invoice.createdAt)}</p>
              <p><span className="font-medium">Due Date:</span> {formatDate(invoice.dueDate)}</p>
              <p><span className="font-medium">Status:</span> {invoice.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </td>
                <td className="text-right py-2">{item.quantity}</td>
                <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                <td className="text-right py-2 font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-1/3">
            <table className="w-full text-right">
              <tbody>
                <tr>
                  <td className="py-1">Subtotal:</td>
                  <td className="py-1 font-medium">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {invoice.taxAmount > 0 && (
                  <tr>
                    <td className="py-1">Tax ({invoice.taxRate}%):</td>
                    <td className="py-1 font-medium">{formatCurrency(invoice.taxAmount)}</td>
                  </tr>
                )}

                <tr className="border-t-2 border-black">
                  <td className="py-2 font-bold text-lg">Total:</td>
                  <td className="py-2 font-bold text-lg">{formatCurrency(invoice.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Status */}
        {payments.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Payment Summary</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Date</th>
                  <th className="text-left py-1">Method</th>
                  <th className="text-right py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={index}>
                    <td className="py-1">{formatDate(payment.paymentDate)}</td>
                    <td className="py-1">{payment.paymentMethod}</td>
                    <td className="text-right py-1">{formatCurrency(payment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {remainingBalance > 0 && (
              <div className="mt-4 text-right">
                <p className="font-semibold">Remaining Balance: {formatCurrency(remainingBalance)}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          {organization && (
            <p>Thank you for your business. If you have any questions, please contact us at {organization.email || organization.phone}.</p>
          )}
        </div>
      </div>
    </div>
  );
}