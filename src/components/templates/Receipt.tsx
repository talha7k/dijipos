'use client';

import { useEffect, useState } from 'react';
import { Order, Organization } from '@/types';
import { defaultReceiptTemplate } from './default-receipt-thermal';
import { createReceiptQRData, generateZatcaQRCode } from '@/lib/zatca-qr';

interface ReceiptProps {
  order: Order;
  organization: Organization | null;
}

export default function Receipt({
  order,
  organization
}: ReceiptProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code on component mount
  useEffect(() => {
    const generateQR = async () => {
      if (organization) {
        try {
          const qrData = createReceiptQRData(order, organization);
          const qrUrl = await generateZatcaQRCode(qrData);
          setQrCodeUrl(qrUrl);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQR();
  }, [order, organization]);

  // Prepare template data
  const templateData = {
    companyName: organization?.name || '',
    companyAddress: organization?.address || '',
    companyPhone: organization?.phone || '',
    companyVat: organization?.vatNumber || '',
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleString(),
    tableName: order.tableName || '',
    customerName: order.customerName || '',
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      total: item.total.toFixed(2)
    })),
    subtotal: (order.subtotal || 0).toFixed(2),
    vatRate: order.taxRate || 0,
    vatAmount: (order.taxAmount || 0).toFixed(2),
    total: (order.total || 0).toFixed(2),
    paymentMethod: 'Cash', // Default, can be enhanced later
    qrCodeUrl: qrCodeUrl,
    includeQR: (order.includeQR !== false) ? 'true' : '' // Include QR by default unless explicitly disabled
  };

  // Replace placeholders in template
  let htmlContent = defaultReceiptTemplate;

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
      className="w-full max-w-md mx-auto"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}