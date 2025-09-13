'use client';

import { Invoice, Tenant, Customer, Supplier } from '@/types';
import ZatcaQR from '@/components/ZatcaQR';
import Image from 'next/image';

interface EnglishInvoiceProps {
  invoice: Invoice;
  tenant: Tenant;
  customer?: Customer; // Customer data if available
  supplier?: Supplier; // Supplier data if available
}

export default function EnglishInvoice({ invoice, tenant, customer, supplier }: EnglishInvoiceProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {/* QR Code - positioned above invoice number */}
          {invoice.includeQR && tenant.vatNumber && (
            <div className="mb-4">
              <ZatcaQR invoice={invoice} tenant={tenant} />
              <p className="text-sm text-gray-600 mt-2">ZATCA Compliant QR Code</p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
          <p className="text-gray-600">Invoice #{invoice.id.slice(-8)}</p>
        </div>
        <div className="text-right">
          {/* Company Logo */}
          {tenant.logoUrl && (
            <div className="mb-4">
              <div className="relative w-48 h-20 ml-auto">
                <Image
                  src={tenant.logoUrl}
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold">{tenant.name}</h2>
          {tenant.nameAr && (
            <p className="text-lg">{tenant.nameAr}</p>
          )}
          <p>{tenant.address}</p>
          <p>{tenant.email}</p>
          <p>{tenant.phone}</p>
          {tenant.vatNumber && <p>VAT: {tenant.vatNumber}</p>}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          {/* Customer Logo */}
          {customer?.logoUrl && (
            <div className="mb-2">
              <div className="relative w-32 h-16">
                <Image
                  src={customer.logoUrl}
                  alt="Customer Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <p className="font-medium">{invoice.clientName}</p>
          {customer?.nameAr && (
            <p className="text-md">{customer.nameAr}</p>
          )}
          <p>{invoice.clientAddress}</p>
          <p>{invoice.clientEmail}</p>
          {invoice.clientVAT && <p>VAT: {invoice.clientVAT}</p>}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Supplier:</h3>
          {/* Supplier Logo */}
          {supplier?.logoUrl && (
            <div className="mb-2">
              <div className="relative w-32 h-16">
                <Image
                  src={supplier.logoUrl}
                  alt="Supplier Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <p className="font-medium">{supplier?.name || 'N/A'}</p>
          {supplier?.nameAr && (
            <p className="text-md">{supplier.nameAr}</p>
          )}
          <p>{supplier?.address || 'N/A'}</p>
          <p>{supplier?.email || 'N/A'}</p>
          {supplier?.vatNumber && <p>VAT: {supplier.vatNumber}</p>}
        </div>
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Invoice Date:</p>
              <p className="font-medium">{invoice.createdAt.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Due Date:</p>
              <p className="font-medium">{invoice.dueDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Status:</p>
              <p className="font-medium capitalize">{invoice.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Qty</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2 text-right">${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Tax ({invoice.taxRate}%):</span>
            <span>${invoice.taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300 pt-2">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Notes:</h3>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Company Stamp */}
      {tenant.stampUrl && (
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div className="relative w-32 h-32">
              <Image
                src={tenant.stampUrl}
                alt="Company Stamp"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Company Stamp</p>
          </div>
        </div>
      )}
    </div>
  );
}