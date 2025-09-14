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
  // Tag 2: Seller VAT Number
  // Tag 3: Invoice Date (YYYY-MM-DD)
  // Tag 4: Invoice Time (HH:MM:SS)
  // Tag 5: Total Amount (with 2 decimal places)
  // Tag 6: VAT Amount (with 2 decimal places)
  // Tag 7: Invoice Number (optional)
  // Tag 8: Buyer Name (optional)
  // Tag 9: Buyer VAT Number (optional)

  const tlvData: string[] = [];

  // Tag 1: Seller Name
  if (data.sellerName) {
    tlvData.push(createTLV(1, data.sellerName));
  }

  // Tag 2: Seller VAT Number
  if (data.sellerVatNumber) {
    tlvData.push(createTLV(2, data.sellerVatNumber));
  }

  // Tag 3: Invoice Date
  if (data.invoiceDate) {
    tlvData.push(createTLV(3, data.invoiceDate));
  }

  // Tag 4: Invoice Time
  if (data.invoiceTime) {
    tlvData.push(createTLV(4, data.invoiceTime));
  }

  // Tag 5: Total Amount
  if (data.totalAmount) {
    tlvData.push(createTLV(5, data.totalAmount));
  }

  // Tag 6: VAT Amount
  if (data.vatAmount) {
    tlvData.push(createTLV(6, data.vatAmount));
  }

  // Tag 7: Invoice Number (optional)
  if (data.invoiceNumber) {
    tlvData.push(createTLV(7, data.invoiceNumber));
  }

  // Tag 8: Buyer Name (optional)
  if (data.buyerName) {
    tlvData.push(createTLV(8, data.buyerName));
  }

  // Tag 9: Buyer VAT Number (optional)
  if (data.buyerVatNumber) {
    tlvData.push(createTLV(9, data.buyerVatNumber));
  }

  return tlvData.join('');
}

/**
 * Create TLV (Tag Length Value) encoded string
 */
function createTLV(tag: number, value: string): string {
  const tagByte = tag.toString(16).padStart(2, '0').toUpperCase();
  const valueBytes = Buffer.from(value, 'utf8');
  const lengthByte = valueBytes.length.toString(16).padStart(2, '0').toUpperCase();

  return tagByte + lengthByte + valueBytes.toString('hex').toUpperCase();
}

/**
 * Generate QR code data URL for ZATCA compliance
 */
export async function generateZatcaQRCode(data: ZatcaQRData): Promise<string> {
  try {
    const qrString = generateZatcaQRString(data);

    const qrDataURL = await QRCode.toDataURL(qrString, {
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
    throw new Error('Failed to generate ZATCA QR code');
  }
}

/**
 * Generate QR code data for invoices
 */
export function createInvoiceQRData(invoice: any, organization: any): ZatcaQRData {
  const invoiceDate = new Date(invoice.createdAt);
  const dateString = invoiceDate.toISOString().split('T')[0];
  const timeString = invoiceDate.toTimeString().split(' ')[0];

  return {
    sellerName: organization?.name || '',
    sellerVatNumber: organization?.vatNumber || '',
    invoiceDate: dateString,
    invoiceTime: timeString,
    totalAmount: invoice.total.toFixed(2),
    vatAmount: invoice.taxAmount.toFixed(2),
    invoiceNumber: invoice.invoiceNumber || invoice.id.slice(-8),
    buyerName: invoice.clientName,
    buyerVatNumber: invoice.clientVAT || ''
  };
}

/**
 * Generate QR code data for receipts/orders
 */
export function createReceiptQRData(order: any, organization: any): ZatcaQRData {
  const orderDate = new Date(order.createdAt);
  const dateString = orderDate.toISOString().split('T')[0];
  const timeString = orderDate.toTimeString().split(' ')[0];

  return {
    sellerName: organization?.name || '',
    sellerVatNumber: organization?.vatNumber || '',
    invoiceDate: dateString,
    invoiceTime: timeString,
    totalAmount: order.total.toFixed(2),
    vatAmount: (order.taxAmount || 0).toFixed(2),
    invoiceNumber: order.orderNumber,
    buyerName: order.customerName || 'Walk-in Customer'
  };
}