'use client';

import { Invoice, Tenant, Customer, Supplier } from '@/types';
import ZatcaQR from '@/components/ZatcaQR';
import Image from 'next/image';

interface ArabicInvoiceProps {
  invoice: Invoice;
  tenant: Tenant;
  customer?: Customer; // Customer data if available
  supplier?: Supplier; // Supplier data if available
}

export default function ArabicInvoice({ invoice, tenant, customer, supplier }: ArabicInvoiceProps) {
  return (
    <div dir="rtl" className="max-w-4xl mx-auto bg-white p-8 shadow-lg print-content" style={{ fontFamily: 'var(--font-amiri)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 flex-row-reverse">
        <div className="text-right">
          {/* QR Code - positioned above invoice number */}
          {invoice.includeQR && tenant.vatNumber && (
            <div className="mb-4">
              <ZatcaQR invoice={invoice} tenant={tenant} />
              <p className="text-sm text-gray-600 mt-2">رمز QR متوافق مع زاتكا</p>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">فاتورة</h1>
          <p className="text-gray-600">رقم الفاتورة #{invoice.id.slice(-8)}</p>
        </div>
        <div className="text-left">
          {/* Company Logo */}
          {tenant.logoUrl && (
            <div className="mb-4">
              <div className="relative w-48 h-20 mr-auto">
                <Image
                  src={tenant.logoUrl}
                  alt="شعار الشركة"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <h2 className="text-xl font-semibold">{tenant.nameAr || tenant.name}</h2>
          {tenant.nameAr && tenant.name && (
            <p className="text-lg">{tenant.name}</p>
          )}
          <p>{tenant.address}</p>
          <p>{tenant.email}</p>
          <p>{tenant.phone}</p>
          {tenant.vatNumber && <p>الرقم الضريبي: {tenant.vatNumber}</p>}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="text-right">
          <h3 className="font-semibold mb-2">:إلى</h3>
          {/* Customer Logo */}
          {customer?.logoUrl && (
            <div className="mb-2">
              <div className="relative w-32 h-16 ml-auto">
                <Image
                  src={customer.logoUrl}
                  alt="شعار العميل"
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
          {invoice.clientVAT && <p>الرقم الضريبي: {invoice.clientVAT}</p>}
        </div>
        <div className="text-left">
          <h3 className="font-semibold mb-2">:المورد</h3>
          {/* Supplier Logo */}
          {supplier?.logoUrl && (
            <div className="mb-2">
              <div className="relative w-32 h-16">
                <Image
                  src={supplier.logoUrl}
                  alt="شعار المورد"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <p className="font-medium">{supplier?.nameAr || supplier?.name || 'غير متوفر'}</p>
          {supplier?.nameAr && supplier?.name && (
            <p className="text-md">{supplier.name}</p>
          )}
          <p>{supplier?.address || 'غير متوفر'}</p>
          <p>{supplier?.email || 'غير متوفر'}</p>
          {supplier?.vatNumber && <p>الرقم الضريبي: {supplier.vatNumber}</p>}
        </div>
        <div className="text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">:تاريخ الفاتورة</p>
              <p className="font-medium">{invoice.createdAt.toLocaleDateString('ar-SA')}</p>
            </div>
            <div>
              <p className="text-gray-600">:تاريخ الاستحقاق</p>
              <p className="font-medium">{invoice.dueDate.toLocaleDateString('ar-SA')}</p>
            </div>
            <div>
              <p className="text-gray-600">:الحالة</p>
              <p className="font-medium capitalize">{invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'sent' ? 'مرسل' : invoice.status === 'draft' ? 'مسودة' : invoice.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-right">الوصف</th>
            <th className="border border-gray-300 px-4 py-2 text-center">الكمية</th>
            <th className="border border-gray-300 px-4 py-2 text-center">سعر الوحدة</th>
            <th className="border border-gray-300 px-4 py-2 text-center">المجموع</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-4 py-2 text-right">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                </div>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{item.unitPrice.toFixed(2)} ريال</td>
              <td className="border border-gray-300 px-4 py-2 text-center">{item.total.toFixed(2)} ريال</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-start mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 flex-row-reverse">
            <span>:المجموع الفرعي</span>
            <span>{invoice.subtotal.toFixed(2)} ريال</span>
          </div>
          <div className="flex justify-between py-2 flex-row-reverse">
            <span>:الضريبة ({invoice.taxRate}%)</span>
            <span>{invoice.taxAmount.toFixed(2)} ريال</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300 pt-2 flex-row-reverse">
            <span>:المجموع الكلي</span>
            <span>{invoice.total.toFixed(2)} ريال</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 text-right">
          <h3 className="font-semibold mb-2">:ملاحظات</h3>
          <p className="text-gray-600">{invoice.notes}</p>
        </div>
      )}

      {/* Company Stamp */}
      {tenant.stampUrl && (
        <div className="flex justify-start mt-8">
          <div className="text-center">
            <div className="relative w-32 h-32">
              <Image
                src={tenant.stampUrl}
                alt="ختم الشركة"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">ختم الشركة</p>
          </div>
        </div>
      )}
    </div>
  );
}