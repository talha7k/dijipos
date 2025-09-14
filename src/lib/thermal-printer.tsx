import React from 'react';
import { Printer, Text, Line, Cut, render, Row, PrinterType } from 'react-thermal-printer';
import { Order, Organization } from '@/types';

// Web Serial API types
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  writable: WritableStream | null;
  getInfo?: () => { usbVendorId?: number; usbProductId?: number };
}

interface Serial extends EventTarget {
  requestPort(): Promise<SerialPort>;
  getPorts(): Promise<SerialPort[]>;
}

interface NavigatorWithSerial extends Navigator {
  serial: Serial;
}

// USB printer vendor IDs for common thermal printers
export const USB_PRINTER_VENDORS = {
  EPSON: 0x04b8,
  STAR: 0x0519,
  CITIZEN: 0x2730,
  TOSHIBA: 0x06b9,
  SAMSUNG: 0x04e8,
  CUSTOM: 0x0000, // For custom/vendor-specific printers
} as const;

// Common USB printer product IDs (examples)
export const USB_PRINTER_PRODUCTS = {
  EPSON_TM_T88V: 0x0202,
  STAR_MPOP: 0x0001,
  CITIZEN_CT_S310: 0x0001,
} as const;

export interface ThermalPrinterConfig {
  type?: PrinterType;
  width?: number;
  characterSet?: string;
  baudRate?: number;
  usbVendorId?: number;
  usbProductId?: number;
  connectionType?: 'serial' | 'usb' | 'browser';
}

export interface ReceiptData {
  order: Order;
  organization: Organization | null;
}

export interface ConnectedPrinter {
  id: string;
  name: string;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
  usbVendorId?: number;
  usbProductId?: number;
}

export interface ConnectedPrinter {
  id: string;
  name: string;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
  usbVendorId?: number;
  usbProductId?: number;
}

// USB Device interface for WebUSB
interface USBDeviceBasic {
  readonly productId?: number;
  readonly productName?: string;
  readonly vendorId?: number;
  readonly manufacturerName?: string;
  readonly serialNumber?: string;
  open(): Promise<void>;
  close(): Promise<void>;
  transferOut(endpointNumber: number, data: ArrayBuffer): Promise<{ bytesWritten: number; status: string }>;
}

// WebUSB Navigator interface
interface NavigatorWithWebUSB {
  usb: {
    getDevices(): Promise<USBDeviceBasic[]>;
    requestDevice(options?: { filters?: Array<{ vendorId?: number; productId?: number }> }): Promise<USBDeviceBasic>;
  };
}

export class ThermalPrinterService {
  private port: SerialPort | null = null;
  private usbDevice: USBDeviceBasic | null = null;
  private connectedPrinter: ConnectedPrinter | null = null;
  private config: ThermalPrinterConfig = {
    type: 'epson',
    width: 48,
    characterSet: 'korea',
    baudRate: 9600,
    connectionType: 'browser', // Default to browser native printing
  };

  /**
   * Get previously connected printers
   */
  async getConnectedPrinters(): Promise<ConnectedPrinter[]> {
    try {
      if (!this.isWebSerialSupported()) {
        console.warn('Web Serial API not supported in this browser');
        return [];
      }

      const ports = await (navigator as NavigatorWithSerial).serial.getPorts();
      return ports.map((port, index) => {
        const info = port.getInfo?.();
        return {
          id: `printer-${index}`,
          name: `Printer ${index + 1}`,
          vendorId: info?.usbVendorId,
          productId: info?.usbProductId,
          usbVendorId: info?.usbVendorId,
          usbProductId: info?.usbProductId,
        };
      });
    } catch (error) {
      console.error('Failed to get connected printers:', error);
      return [];
    }
  }

  /**
   * Check if Web Serial API is supported
   */
  isWebSerialSupported(): boolean {
    return 'serial' in navigator && !!(navigator as NavigatorWithSerial).serial;
  }

  /**
   * Check if WebUSB API is supported
   */
  isWebUSBSupported(): boolean {
    return 'usb' in navigator && !!(navigator as unknown as { usb?: unknown }).usb;
  }

  /**
   * Get connected USB printers
   */
  async getConnectedUSBPrinters(): Promise<ConnectedPrinter[]> {
    try {
      if (!this.isWebUSBSupported()) {
        return [];
      }

      const usbNavigator = navigator as unknown as { usb: { getDevices(): Promise<USBDeviceBasic[]>; requestDevice(options?: { filters?: Array<{ vendorId?: number; productId?: number }> }): Promise<USBDeviceBasic> } };
      const devices = await usbNavigator.usb.getDevices();
      return devices
        .filter((device) => this.isThermalPrinter(device))
        .map((device, index) => ({
          id: `usb-printer-${index}`,
          name: device.productName || `USB Printer ${index + 1}`,
          vendorId: device.vendorId,
          productId: device.productId,
          usbVendorId: device.vendorId,
          usbProductId: device.productId,
          serialNumber: device.serialNumber,
        }));
    } catch (error) {
      console.error('Failed to get connected USB printers:', error);
      return [];
    }
  }

  /**
   * Request USB printer connection
   */
  async requestUSBPrinterConnection(): Promise<ConnectedPrinter | null> {
    try {
      if (!this.isWebUSBSupported()) {
        throw new Error('WebUSB API not supported in this browser');
      }

      const usbNavigator = navigator as unknown as { usb: { getDevices(): Promise<USBDeviceBasic[]>; requestDevice(options?: { filters?: Array<{ vendorId?: number; productId?: number }> }): Promise<USBDeviceBasic> } };
      const device = await usbNavigator.usb.requestDevice({
        filters: this.getUSBDeviceFilters()
      });

      await device.open();
      this.usbDevice = device;

      this.connectedPrinter = {
        id: 'usb-current',
        name: device.productName || 'USB Thermal Printer',
        vendorId: device.vendorId,
        productId: device.productId,
        usbVendorId: device.vendorId,
        usbProductId: device.productId,
        serialNumber: device.serialNumber,
      };

      console.log('Connected to USB thermal printer');
      return this.connectedPrinter;
    } catch (error: unknown) {
      console.error('Failed to connect to USB thermal printer:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('USB printer access was denied. Please allow access when prompted.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No USB printer was selected. Please ensure your printer is connected and try again.');
        } else {
          throw error;
        }
      } else {
        throw new Error('Failed to connect to USB thermal printer. Please check your printer connection.');
      }
    }
  }

  /**
   * Check if device is a thermal printer
   */
  private isThermalPrinter(device: USBDeviceBasic): boolean {
    if (!device.vendorId) return false;

    // Common thermal printer vendor IDs
    const thermalPrinterVendors: number[] = [
      USB_PRINTER_VENDORS.EPSON,
      USB_PRINTER_VENDORS.STAR,
      USB_PRINTER_VENDORS.CITIZEN,
      USB_PRINTER_VENDORS.TOSHIBA,
      USB_PRINTER_VENDORS.SAMSUNG,
    ];

    return thermalPrinterVendors.includes(device.vendorId);
  }

  /**
   * Get USB device filters for thermal printers
   */
  private getUSBDeviceFilters(): Array<{ vendorId?: number; productId?: number }> {
    return [
      // Epson printers
      { vendorId: USB_PRINTER_VENDORS.EPSON },
      // Star printers
      { vendorId: USB_PRINTER_VENDORS.STAR },
      // Citizen printers
      { vendorId: USB_PRINTER_VENDORS.CITIZEN },
      // Toshiba printers
      { vendorId: USB_PRINTER_VENDORS.TOSHIBA },
      // Samsung printers
      { vendorId: USB_PRINTER_VENDORS.SAMSUNG },
    ];
  }

  /**
   * Request user to select and connect to a new printer
   */
  async requestPrinterConnection(): Promise<ConnectedPrinter | null> {
    try {
      if (!this.isWebSerialSupported()) {
        throw new Error('Web Serial API is not supported in this browser. Please use a compatible browser like Chrome, Edge, or Opera.');
      }

      const port = await (navigator as NavigatorWithSerial).serial.requestPort();
      await port.open({ baudRate: this.config.baudRate! });

      // Store printer info
      const info = port.getInfo?.();
      this.port = port;
      this.connectedPrinter = {
        id: 'current',
        name: 'Connected Printer',
        vendorId: info?.usbVendorId,
        productId: info?.usbProductId,
        usbVendorId: info?.usbVendorId,
        usbProductId: info?.usbProductId,
      };

      console.log('Connected to thermal printer');
      return this.connectedPrinter;
    } catch (error: unknown) {
      console.error('Failed to connect to thermal printer:', error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Printer access was denied. Please allow access to the printer when prompted.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No printer was selected or found. Please ensure your printer is connected and try again.');
        } else {
          throw error;
        }
      } else {
        throw new Error('Failed to connect to thermal printer. Please check your printer connection and try again.');
      }
    }
  }

  /**
   * Connect to a thermal printer via Web Serial API
   */
  async connect(): Promise<void> {
    try {
      if (!(navigator as NavigatorWithSerial).serial) {
        throw new Error('Web Serial API not supported in this browser');
      }

      this.port = await (navigator as NavigatorWithSerial).serial.requestPort();
      await this.port.open({ baudRate: this.config.baudRate! });

      // Store printer info
      const info = this.port.getInfo?.();
      this.connectedPrinter = {
        id: 'current',
        name: 'Connected Printer',
        vendorId: info?.usbVendorId,
        productId: info?.usbProductId,
        usbVendorId: info?.usbVendorId,
        usbProductId: info?.usbProductId,
      };

      console.log('Connected to thermal printer');
    } catch (error) {
      console.error('Failed to connect to thermal printer:', error);
      throw new Error('Failed to connect to thermal printer. Please check your printer connection.');
    }
  }



  /**
   * Disconnect from the thermal printer
   */
  async disconnect(): Promise<void> {
    try {
      if (this.port) {
        await this.port.close();
        this.port = null;
        console.log('Disconnected from serial thermal printer');
      }

      if (this.usbDevice) {
        await this.usbDevice.close();
        this.usbDevice = null;
        console.log('Disconnected from USB thermal printer');
      }

      this.connectedPrinter = null;
    } catch (error) {
      console.error('Error disconnecting from thermal printer:', error);
      throw new Error('Failed to disconnect from printer');
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.port !== null || this.usbDevice !== null;
  }

  /**
   * Get current connected printer info
   */
  getConnectedPrinter(): ConnectedPrinter | null {
    return this.connectedPrinter;
  }

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
      if (this.config.connectionType === 'browser') {
        await this.printViaBrowser(receiptData);
      } else if (this.config.connectionType === 'usb' && this.usbDevice) {
        const receiptContent = this.createReceiptComponent(receiptData);
        const data = await render(receiptContent);
        await this.printViaUSB(data);
      } else if (this.config.connectionType === 'serial' && this.port) {
        const receiptContent = this.createReceiptComponent(receiptData);
        const data = await render(receiptContent);
        await this.printViaSerial(data);
      } else {
        throw new Error('No valid printer connection available');
      }

      console.log('Receipt printed successfully');
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw new Error('Failed to print receipt. Please check printer connection.');
    }
  }

  /**
   * Print via USB connection
   */
  private async printViaUSB(data: Uint8Array): Promise<void> {
    if (!this.usbDevice) {
      throw new Error('USB device not connected');
    }

    try {
      // For most thermal printers, endpoint 1 is the bulk out endpoint
      // Create a new ArrayBuffer and copy the data
      const buffer = new ArrayBuffer(data.length);
      new Uint8Array(buffer).set(data);
      const result = await this.usbDevice.transferOut(1, buffer);
      if (result.status !== 'ok') {
        throw new Error(`USB transfer failed with status: ${result.status}`);
      }
    } catch (error) {
      console.error('USB printing error:', error);
      throw new Error('Failed to print via USB. Please check USB connection.');
    }
  }

  /**
   * Print via Serial connection
   */
  private async printViaSerial(data: Uint8Array): Promise<void> {
    if (!this.port) {
      throw new Error('Serial port not connected');
    }

    const writer = this.port.writable?.getWriter();
    if (!writer) {
      throw new Error('Unable to get writer for thermal printer');
    }

    try {
      await writer.write(data);
      await writer.close();
    } catch (error) {
      console.error('Serial printing error:', error);
      throw new Error('Failed to print via serial. Please check serial connection.');
    }
  }

  /**
   * Print via browser native print dialog
   */
  private async printViaBrowser(receiptData: ReceiptData): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=600');

        if (!printWindow) {
          reject(new Error('Unable to open print window. Please allow popups for this site.'));
          return;
        }

        // Generate HTML content for thermal printer format
        const htmlContent = this.generatePrintHTML(receiptData);

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
   * Generate HTML content optimized for thermal printers
   */
  private generatePrintHTML({ order, organization }: ReceiptData): string {
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
      if (this.config.connectionType === 'browser') {
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
                type: 'product' as any,
                name: 'Test Item 1',
                quantity: 2,
                unitPrice: 5.00,
                total: 10.00
              },
              {
                id: 'test-item-2',
                type: 'product' as any,
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
            status: 'completed' as any,
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
            subscriptionStatus: 'active' as any
          }
        };
        await this.printViaBrowser(testReceiptData);
      } else if (this.config.connectionType === 'usb' && this.usbDevice) {
        const testContent = (
          <Printer type={this.config.type || 'epson'} width={this.config.width || 48} debug={false}>
            <Text align="center" bold>Test Receipt</Text>
            <Line />
            <Text>This is a test print</Text>
            <Text>Printer is working correctly!</Text>
            <Text>Connection: USB</Text>
            <Line />
            <Text align="center">Thank you</Text>
            <Cut />
          </Printer>
        );
        const data = await render(testContent);
        await this.printViaUSB(data);
      } else if (this.config.connectionType === 'serial' && this.port) {
        const testContent = (
          <Printer type={this.config.type || 'epson'} width={this.config.width || 48} debug={false}>
            <Text align="center" bold>Test Receipt</Text>
            <Line />
            <Text>This is a test print</Text>
            <Text>Printer is working correctly!</Text>
            <Text>Connection: SERIAL</Text>
            <Line />
            <Text align="center">Thank you</Text>
            <Cut />
          </Printer>
        );
        const data = await render(testContent);
        await this.printViaSerial(data);
      } else {
        throw new Error('No valid printer connection available');
      }

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