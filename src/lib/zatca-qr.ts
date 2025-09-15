import QRCode from 'qrcode';

/**
 * ZATCA (Zakat, Tax and Customs Authority) QR Code Generator
 * Compliant with Saudi Arabia's e-invoicing requirements
 */

export interface ZatcaQRData {
  sellerName: string;
  sellerVatNumber: string;
  invoiceDate: string;
  invoiceTime: string;
  totalAmount: string;
  vatAmount: string;
  invoiceNumber?: string;
  buyerName?: string;
  buyerVatNumber?: string;
}

/**
 * Generate ZATCA compliant QR code data string
 */
export function generateZatcaQRString(data: ZatcaQRData): string {
  // ZATCA QR code format (TLV - Tag Length Value)
  // Tag 1: Seller Name
  // Tag 2: VAT Number  
  // Tag 3: Time Stamp (YYYY-MM-DD HH:MM:SS)
  // Tag 4: Invoice Total
  // Tag 5: VAT Total

  // Validate required fields
  if (!data.sellerName || data.sellerName.trim() === '') {
    throw new Error('Seller name is required for ZATCA QR code');
  }

  if (!data.invoiceDate || data.invoiceDate.trim() === '') {
    throw new Error('Invoice date is required for ZATCA QR code');
  }

  if (!data.totalAmount || data.totalAmount.trim() === '') {
    throw new Error('Total amount is required for ZATCA QR code');
  }

  const tlvData: string[] = [];

  // Tag 1: Seller Name (required)
  tlvData.push(createTLV(1, data.sellerName.trim()));

  // Tag 2: VAT Number (required for ZATCA, use placeholder if not available)
  const sellerVat = data.sellerVatNumber?.trim() || 'N/A';
  tlvData.push(createTLV(2, sellerVat));

  // Tag 3: Time Stamp (required) - Format: YYYY-MM-DD HH:MM:SS
  const timestamp = `${data.invoiceDate.trim()} ${data.invoiceTime?.trim() || '00:00:00'}`;
  tlvData.push(createTLV(3, timestamp));

  // Tag 4: Invoice Total (required)
  tlvData.push(createTLV(4, data.totalAmount.trim()));

  // Tag 5: VAT Total (required, use 0.00 if not available)
  const vatAmount = data.vatAmount?.trim() || '0.00';
  tlvData.push(createTLV(5, vatAmount));

  const result = tlvData.join('');
  console.log('Generated TLV string:', result);
  return result;
}

/**
 * Generate ZATCA compliant QR code data string with new field structure
 */
export function generateZatcaQRStringV2(data: { sellerName: string; vatNumber: string; timestamp: string; invoiceTotal: string; vatTotal: string }): string {
  // Parse timestamp to extract date and time
  const timestamp = new Date(data.timestamp);
  const dateString = timestamp.toISOString().split('T')[0];
  const timeString = timestamp.toTimeString().split(' ')[0];

  // Create ZatcaQRData structure for TLV generation
  const zatcaData: ZatcaQRData = {
    sellerName: data.sellerName,
    sellerVatNumber: data.vatNumber,
    invoiceDate: dateString,
    invoiceTime: timeString,
    totalAmount: data.invoiceTotal,
    vatAmount: data.vatTotal
  };

  return generateZatcaQRString(zatcaData);
}

/**
 * Create TLV (Tag Length Value) encoded string
 */
function createTLV(tag: number, value: string): string {
  const tagByte = tag.toString(16).padStart(2, '0').toUpperCase();
  
  // Convert string to bytes using UTF-8 encoding
  const encoder = new TextEncoder();
  const valueBytes = encoder.encode(value);
  const lengthByte = valueBytes.length.toString(16).padStart(2, '0').toUpperCase();

  // Convert value bytes to hex string
  const valueHex = Array.from(valueBytes)
    .map(byte => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  return tagByte + lengthByte + valueHex;
}

/**
 * Generate QR code data URL for ZATCA compliance
 */
export async function generateZatcaQRCode(data: ZatcaQRData): Promise<string> {
  try {
    // Generate TLV string from the structured data
    const qrString = generateZatcaQRString(data);
    
    // Convert TLV hex string to Base64 (ZATCA requirement)
    const tlvBuffer = Buffer.from(qrString, 'hex');
    const base64String = tlvBuffer.toString('base64');
    
    // Log the generated strings for debugging
    console.log('ZATCA QR Data:', data);
    console.log('ZATCA QR TLV String:', qrString);
    console.log('ZATCA QR Base64 String:', base64String);

    const qrDataURL = await QRCode.toDataURL(base64String, {
      width: 150,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrDataURL;
  } catch (error) {
    console.error('Failed to generate ZATCA QR code:', error);
    console.error('QR Data that failed:', data);
    throw new Error('Failed to generate ZATCA QR code');
  }
}

/**
 * Generate QR code data for invoices
 */
export function createInvoiceQRData(invoice: { createdAt: Date | string; total: number; taxAmount?: number; invoiceNumber?: string; id: string; clientName?: string; clientVAT?: string }, organization: { name?: string; vatNumber?: string } | null): ZatcaQRData {
  const invoiceDate = new Date(invoice.createdAt);
  const dateString = invoiceDate.toISOString().split('T')[0];
  const timeString = invoiceDate.toTimeString().split(' ')[0];

  // Ensure taxAmount is a number, default to 0 if undefined
  const taxAmount = typeof invoice.taxAmount === 'number' ? invoice.taxAmount : 0;

  // Validate organization data
  const sellerName = organization?.name?.trim() || 'Unknown Seller';
  const sellerVatNumber = organization?.vatNumber?.trim() || '';

  // Validate invoice data
  const total = typeof invoice.total === 'number' ? invoice.total : 0;
  const invoiceNumber = invoice.invoiceNumber?.trim() || invoice.id.slice(-8);

  const result = {
    sellerName,
    sellerVatNumber,
    invoiceDate: dateString,
    invoiceTime: timeString,
    totalAmount: total.toFixed(2),
    vatAmount: taxAmount.toFixed(2),
    invoiceNumber: invoiceNumber,
    buyerName: invoice.clientName?.trim() || '',
    buyerVatNumber: invoice.clientVAT?.trim() || ''
  };

  console.log('Invoice QR Data:', result);
  return result;
}

/**
 * Generate QR code data for receipts/orders
 */
export function createReceiptQRData(order: { createdAt: Date | string; total: number; taxAmount?: number; orderNumber: string; customerName?: string }, organization: { name?: string; vatNumber?: string } | null): ZatcaQRData {
  const orderDate = new Date(order.createdAt);
  const dateString = orderDate.toISOString().split('T')[0];
  const timeString = orderDate.toTimeString().split(' ')[0];

  // Ensure taxAmount is a number, default to 0 if undefined
  const taxAmount = typeof order.taxAmount === 'number' ? order.taxAmount : 0;

  // Validate organization data
  const sellerName = organization?.name?.trim() || 'Unknown Seller';
  const sellerVatNumber = organization?.vatNumber?.trim() || '';

  // Validate order data
  const total = typeof order.total === 'number' ? order.total : 0;
  const orderNumber = order.orderNumber?.trim() || 'UNKNOWN';

  const result = {
    sellerName,
    sellerVatNumber,
    invoiceDate: dateString,
    invoiceTime: timeString,
    totalAmount: total.toFixed(2),
    vatAmount: taxAmount.toFixed(2),
    invoiceNumber: orderNumber,
    buyerName: order.customerName?.trim() || 'Walk-in Customer'
  };

  // Add detailed debugging for VAT number and invoice number
  console.log('=== QR Data Debug ===');
  console.log('Organization VAT Number:', organization?.vatNumber);
  console.log('Organization VAT Number (trimmed):', sellerVatNumber);
  console.log('Organization VAT Number length:', sellerVatNumber.length);
  console.log('Order Number:', order.orderNumber);
  console.log('Order Number (trimmed):', orderNumber);
  console.log('Final QR Data:', result);
  console.log('=== End Debug ===');

  return result;
}

/**
 * Test function to validate QR code generation
 */
export function testQRCodeGeneration(): void {
  const testOrder = {
    createdAt: new Date(),
    total: 100.50,
    taxAmount: 15.08,
    orderNumber: 'TEST-001',
    customerName: 'Test Customer'
  };

  const testOrganization = {
    name: 'Test Company',
    vatNumber: '1234567890'
  };

  try {
    const qrData = createReceiptQRData(testOrder, testOrganization);
    const qrString = generateZatcaQRString(qrData);
    
    console.log('=== QR Code Test ===');
    console.log('Test Order:', testOrder);
    console.log('Test Organization:', testOrganization);
    console.log('Generated QR Data:', qrData);
    console.log('Generated TLV String:', qrString);
    console.log('=== End Test ===');
  } catch (error) {
    console.error('QR Code Test Failed:', error);
  }
}