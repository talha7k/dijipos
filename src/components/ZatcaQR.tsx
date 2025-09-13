'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Invoice, Organization } from '@/types';

interface ZatcaQRProps {
  invoice: Invoice;
  organization: Organization;
}

export default function ZatcaQR({ invoice, organization }: ZatcaQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // ZATCA QR code format (simplified)
    const sellerName = organization.name;
    const vatNumber = organization.vatNumber || '';
    const invoiceDate = invoice.createdAt.toISOString().split('T')[0];
    const total = invoice.total.toFixed(2);
    const vatAmount = invoice.taxAmount.toFixed(2);

    // Create QR data (simplified for demo)
    const qrString = JSON.stringify({
      sellerName,
      vatNumber,
      invoiceDate,
      total,
      vatAmount,
    });

    QRCode.toCanvas(canvasRef.current, qrString, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }, [invoice, organization]);

  return <canvas ref={canvasRef} />;
}