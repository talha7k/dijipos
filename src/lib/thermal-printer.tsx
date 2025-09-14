import React from 'react';
import { Printer, Text, Line, Cut, Row, PrinterType } from 'react-thermal-printer';
import QRCode from 'qrcode';
import { Order, Organization, ItemType, OrderStatus, SubscriptionStatus } from '@/types';



export interface ThermalPrinterConfig {
  type?: PrinterType;
  width?: number;
  characterSet?: string;
  connectionType?: 'browser';
}

export interface ReceiptData {
  order: Order;
  organization: Organization | null;
}



export class ThermalPrinterService {
  private config: ThermalPrinterConfig = {
    type: 'epson',
    width: 48,
    characterSet: 'korea',
    connectionType: 'browser', // Default to browser native printing
  };













  /**
   * Update printer configuration
   */
  updateConfig(config: Partial<ThermalPrinterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Print a receipt
   */
  async printReceipt(receiptData: ReceiptData): Promise<void> {
    try {
      await this.printViaBrowser(receiptData);
      console.log('Receipt printed successfully');
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw new Error('Failed to print receipt. Please check printer connection.');
    }
  }

  /**
   * Print via browser native print dialog
   */
  private async printViaBrowser(receiptData: ReceiptData): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=600');

        if (!printWindow) {
          reject(new Error('Unable to open print window. Please allow popups for this site.'));
          return;
        }

        // Generate HTML content for thermal printer format
        const htmlContent = await this.generatePrintHTML(receiptData);

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print();

          // Close the window after printing (with a delay to allow print dialog)
          setTimeout(() => {
            printWindow.close();
            resolve();
          }, 1000);
        };

        // Handle print window close without printing
        const checkClosed = setInterval(() => {
          if (printWindow.closed) {
            clearInterval(checkClosed);
            resolve(); // Consider it successful even if window was closed
          }
        }, 500);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate QR code data URL for receipt
   */
  private async generateQRCodeData(order: Order, organization: Organization | null): Promise<string> {
    try {
      const qrData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        date: order.createdAt,
        organization: organization?.name || '',
        items: order.items.length,
        paymentMethod: 'Cash', // Default payment method
      };

      const qrString = JSON.stringify(qrData);
      const qrDataURL = await QRCode.toDataURL(qrString, {
        width: 128,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrDataURL;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  }

  /**
   * Generate HTML content optimized for thermal printers
   */
  private async generatePrintHTML({ order, organization }: ReceiptData): Promise<string> {
    // Generate QR code for the receipt
    const qrCodeDataURL = await this.generateQRCodeData(order, organization);

    const items = order.items.map(item => `
      <div class="item">
        <span class="item-name">${item.name} (x${item.quantity})</span>
        <span class="item-price">${item.total.toFixed(2)}</span>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                width: 80mm;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5mm;
              }
            }

            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 10px;
              max-width: 80mm;
            }

            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { flex: 1; }
            .item-price { margin-left: 10px; }
            .total-line { font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
            .qr-code { text-align: center; margin: 10px 0; }
            .qr-code img { max-width: 100px; height: auto; }
          </style>
        </head>
        <body>
          <div class="center bold">${organization?.name || ''}</div>
          <div class="center">${organization?.address || ''}</div>
          <div class="center">Tel: ${organization?.phone || ''}</div>
          ${organization?.vatNumber ? `<div class="center">VAT: ${organization.vatNumber}</div>` : ''}
          <div class="line"></div>

          <div class="center">Order #: ${order.orderNumber}</div>
          <div class="center">Date: ${new Date(order.createdAt).toLocaleDateString()}</div>
          ${order.tableName ? `<div class="center">Table: ${order.tableName}</div>` : ''}
          ${order.customerName ? `<div class="center">Customer: ${order.customerName}</div>` : ''}
          <div class="line"></div>

          ${items}

          <div class="line"></div>
          <div class="item">
            <span>Subtotal:</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="item">
            <span>VAT (${order.taxRate}%):</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>
          <div class="item total-line">
            <span>TOTAL:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
          <div class="line"></div>

           <div class="center">Payment: Cash</div>
           <div class="center">Thank you for your business!</div>

           ${qrCodeDataURL ? `
           <div class="line"></div>
           <div class="qr-code">
             <img src="${qrCodeDataURL}" alt="Receipt QR Code" />
           </div>
           ` : ''}
         </body>
      </html>
    `;
  }

  /**
   * Create the receipt React component
   */
  private createReceiptComponent({ order, organization }: ReceiptData) {
    return (
      <Printer
        type={this.config.type || 'epson'}
        width={this.config.width || 48}
        debug={false}
      >
        {/* Company Header */}
        <Text align="center" bold>{organization?.name || ''}</Text>
        <Text align="center">{organization?.address || ''}</Text>
        <Text align="center">Tel: {organization?.phone || ''}</Text>
        {organization?.vatNumber && <Text align="center">VAT: {organization.vatNumber}</Text>}
        <Line />

        {/* Order Info */}
        <Text align="center">Order #: {order.orderNumber}</Text>
        <Text align="center">Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
        {order.tableName && <Text align="center">Table: {order.tableName}</Text>}
        {order.customerName && <Text align="center">Customer: {order.customerName}</Text>}
        <Line />

        {/* Order Items */}
        {order.items.map((item, index) => (
          <Row key={index} left={`${item.name} (x${item.quantity})`} right={item.total.toFixed(2)} />
        ))}
        <Line />

        {/* Totals */}
        <Row left="Subtotal:" right={order.subtotal.toFixed(2)} />
        <Row left={`VAT (${order.taxRate}%):`} right={order.taxAmount.toFixed(2)} />
        <Row left="TOTAL:" right={order.total.toFixed(2)} />
        <Line />

        {/* Footer */}
        <Text align="center">Payment: Cash</Text>
        <Text align="center">Thank you for your business!</Text>
        <Cut />
      </Printer>
    );
  }

  /**
   * Print test receipt
   */
  async printTest(): Promise<void> {
    try {
      // Create test receipt data
      const testReceiptData: ReceiptData = {
        order: {
          id: 'test-order',
          organizationId: 'test-org',
          orderNumber: 'TEST-001',
          createdAt: new Date(),
          updatedAt: new Date(),
            items: [
              {
                id: 'test-item-1',
                type: ItemType.PRODUCT,
                name: 'Test Item 1',
                quantity: 2,
                unitPrice: 5.00,
                total: 10.00
              },
              {
                id: 'test-item-2',
                type: ItemType.PRODUCT,
                name: 'Test Item 2',
                quantity: 1,
                unitPrice: 15.00,
                total: 15.00
              }
            ],
          subtotal: 25.00,
          taxRate: 10,
          taxAmount: 2.50,
          total: 27.50,
          status: OrderStatus.COMPLETED,
          paid: true,
          orderType: 'dine-in',
          createdById: 'test-user',
          createdByName: 'Test User',
          tableName: 'Test Table',
          customerName: 'Test Customer'
        },
        organization: {
          id: 'test-org',
          name: 'Test Restaurant',
          email: 'test@example.com',
          address: '123 Test Street',
          phone: '555-0123',
          vatNumber: 'TEST123',
          createdAt: new Date(),
          updatedAt: new Date(),
          subscriptionStatus: SubscriptionStatus.ACTIVE
        }
      };
      await this.printViaBrowser(testReceiptData);
      console.log('Test receipt printed successfully');
    } catch (error) {
      console.error('Error printing test receipt:', error);
      throw new Error('Failed to print test receipt.');
    }
  }
}

// Export a singleton instance
export const thermalPrinter = new ThermalPrinterService();
export default thermalPrinter;