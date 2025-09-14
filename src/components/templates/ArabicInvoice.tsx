'use client';

import { useEffect, useState } from 'react';
import { Invoice, Organization, Customer, Supplier } from '@/types';
import { defaultArabicInvoiceTemplate } from './default-invoice-arabic';
import { createInvoiceQRData, generateZatcaQRCode } from '@/lib/zatca-qr';

interface ArabicInvoiceProps {
  invoice: Invoice;
  organization: Organization | null;
  customer?: Customer;
  supplier?: Supplier;
}

export default function ArabicInvoice({
  invoice,
  organization,
  customer,
  supplier
}: ArabicInvoiceProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code on component mount
  useEffect(() => {
    const generateQR = async () => {
      if (organization && invoice.includeQR) {
        try {
          const qrData = createInvoiceQRData(invoice, organization);
          const qrUrl = await generateZatcaQRCode(qrData);
          setQrCodeUrl(qrUrl);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQR();
  }, [invoice, organization]);
  // Prepare template data
  const templateData = {
    invoiceId: invoice.invoiceNumber || invoice.id.slice(-8),
    companyName: organization?.name || '',
    companyNameAr: organization?.nameAr || '',
    companyAddress: organization?.address || '',
    companyEmail: organization?.email || '',
    companyPhone: organization?.phone || '',
    companyVat: organization?.vatNumber || '',
    companyLogo: organization?.logoUrl || '',
    companyStamp: organization?.stampUrl || '',
    clientName: invoice.clientName || '',
    customerNameAr: customer?.nameAr || '',
    clientAddress: invoice.clientAddress || '',
    clientEmail: invoice.clientEmail || '',
    clientVat: invoice.clientVAT || '',
    customerLogo: customer?.logoUrl || '',
    supplierName: supplier?.name || '',
    supplierNameAr: supplier?.nameAr || '',
    supplierAddress: supplier?.address || '',
    supplierEmail: supplier?.email || '',
    supplierVat: supplier?.vatNumber || '',
    supplierLogo: supplier?.logoUrl || '',
    invoiceDate: invoice.createdAt.toLocaleDateString('ar-SA'),
    dueDate: invoice.dueDate.toLocaleDateString('ar-SA'),
    status: invoice.status === 'paid' ? 'مدفوع' : invoice.status === 'sent' ? 'مرسل' : invoice.status === 'draft' ? 'مسودة' : invoice.status,
    items: invoice.items.map(item => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2)
    })),
    subtotal: invoice.subtotal.toFixed(2),
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount.toFixed(2),
    total: invoice.total.toFixed(2),
    notes: invoice.notes || '',
    qrCodeUrl: qrCodeUrl,
    includeQR: invoice.includeQR && qrCodeUrl ? 'true' : ''
  };

  // Replace placeholders in template
  let htmlContent = defaultArabicInvoiceTemplate;

  // Replace simple placeholders
  Object.entries(templateData).forEach(([key, value]) => {
    if (key !== 'items' && key !== 'includeQR') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      htmlContent = htmlContent.replace(regex, String(value));
    }
  });

  // Handle conditional sections
  if (templateData.includeQR && qrCodeUrl) {
    htmlContent = htmlContent.replace(/{{#includeQR}}/g, '');
    htmlContent = htmlContent.replace(/{{\/includeQR}}/g, '');
  } else {
    const qrRegex = /{{#includeQR}}[\s\S]*?{{\/includeQR}}/g;
    htmlContent = htmlContent.replace(qrRegex, '');
  }

  // Handle other conditional sections
  const conditionals = [
    'companyLogo', 'companyName', 'companyVat', 'customerLogo', 'customerNameAr',
    'clientVat', 'supplierLogo', 'supplierNameAr', 'supplierVat', 'notes', 'companyStamp'
  ];

  conditionals.forEach(field => {
    const value = templateData[field as keyof typeof templateData];
    if (value && value !== '') {
      const regex = new RegExp(`{{#${field}}}(.*?){{\/${field}}}`, 'gs');
      htmlContent = htmlContent.replace(regex, '$1');
    } else {
      const regex = new RegExp(`{{#${field}}}[\s\S]*?{{\/${field}}}`, 'gs');
      htmlContent = htmlContent.replace(regex, '');
    }
  });

  // Handle items loop
  const itemsRegex = /{{#each items}}([\s\S]*?){{\/each}}/;
  const itemsMatch = htmlContent.match(itemsRegex);
  if (itemsMatch && templateData.items) {
    const itemTemplate = itemsMatch[1];
    const itemsHtml = templateData.items.map(item => {
      let itemHtml = itemTemplate;
      Object.entries(item).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        itemHtml = itemHtml.replace(regex, String(value));
      });
      return itemHtml;
    }).join('');
    htmlContent = htmlContent.replace(itemsRegex, itemsHtml);
  }

  return (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}