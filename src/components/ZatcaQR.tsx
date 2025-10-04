'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Invoice, Organization } from '@/types';
import { createInvoiceQRData, generateZatcaQRCode } from '@/lib/zatca-qr';

interface ZatcaQRProps {
  invoice: Invoice;
  organization: Organization;
}

export default function ZatcaQR({ invoice, organization }: ZatcaQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const generateQR = async () => {
      try {
        // Create ZATCA compliant QR data
        const qrData = createInvoiceQRData(invoice, organization);
        
        // Generate ZATCA QR code with JSON Base64 encoding
        const qrDataURL = await generateZatcaQRCode(qrData);

        // Create an image from the data URL and draw it on canvas
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = 150;
              canvas.height = 150;
              ctx.drawImage(img, 0, 0, 150, 150);
            }
          }
        };
        img.src = qrDataURL;
      } catch (error) {
        console.error('Failed to generate ZATCA QR code:', error);
        // Fallback to ZATCA JSON format if generation fails
        const sellerName = organization.name;
        const vatNumber = organization.vatNumber || '';
        const createdAt = new Date(invoice.createdAt);
        const invoiceDate = !isNaN(createdAt.getTime()) ? createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const invoiceTime = !isNaN(createdAt.getTime()) ? createdAt.toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0];
        const total = invoice.total.toFixed(2);
        const vatAmount = invoice.taxAmount.toFixed(2);

        const fallbackJson = {
          sellerName,
          vatNumber,
          timestamp: `${invoiceDate}T${invoiceTime}Z`,
          invoiceTotal: total,
          vatTotal: vatAmount
        };

        const fallbackString = JSON.stringify(fallbackJson);
        const fallbackBase64 = Buffer.from(fallbackString).toString('base64');

        QRCode.toCanvas(canvasRef.current, fallbackBase64, {
          width: 150,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      }
    };

    generateQR();
  }, [invoice, organization]);

  return <canvas ref={canvasRef} />;
}