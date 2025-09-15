'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { createReceiptQRData, generateZatcaQRString, testQRCodeGeneration } from '@/lib/zatca-qr';

export default function TestQRPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState<any>(null);
  const [tlvString, setTlvString] = useState<string>('');

  useEffect(() => {
    // Run the QR code test when the page loads
    testQRCodeGeneration();

    // Generate test QR data and display it
    const testOrder = {
      createdAt: new Date(),
      total: 100.50,
      taxAmount: 15.08,
      orderNumber: 'TEST-001',
      customerName: 'Test Customer'
    };

    const testOrganization = {
      name: 'Test Company LLC',
      vatNumber: '123456789012343'
    };

    try {
      const qrData = createReceiptQRData(testOrder, testOrganization);
      const tlvString = generateZatcaQRString(qrData);
      
      setQrData(qrData);
      setTlvString(tlvString);

      // Generate QR code on canvas
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, tlvString, {
          width: 200,
          margin: 2,
          errorCorrectionLevel: 'M'
        });
      }
    } catch (error) {
      console.error('QR Code generation failed:', error);
    }
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">QR Code Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated QR Code</h2>
          <div className="border p-4 rounded">
            <canvas ref={canvasRef} className="mx-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">QR Data</h2>
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Raw Data:</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto">
              {JSON.stringify(qrData, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">TLV String:</h3>
            <pre className="text-sm bg-white p-2 rounded overflow-auto break-all">
              {tlvString}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded">
        <h2 className="font-semibold mb-2">Test Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Check if QR code is visible above</li>
          <li>Verify QR data contains all required fields</li>
          <li>Check TLV string format (should be hex encoded)</li>
          <li>Scan QR code with phone to verify content</li>
          <li>Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  );
}