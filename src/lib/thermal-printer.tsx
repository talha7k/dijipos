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
  connectionType?: 'serial' | 'usb';
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
    connectionType: 'serial',
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
    return 'usb' in navigator && !!(navigator as unknown as NavigatorWithWebUSB).usb;
  }

  /**
   * Get connected USB printers
   */
  async getConnectedUSBPrinters(): Promise<ConnectedPrinter[]> {
    try {
      if (!this.isWebUSBSupported()) {
        return [];
      }

      const usbNavigator = navigator as unknown as NavigatorWithWebUSB;
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

      const usbNavigator = navigator as unknown as NavigatorWithWebUSB;
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
    if (!this.port && !this.usbDevice) {
      throw new Error('Printer not connected. Please connect to a thermal printer first.');
    }

    try {
      const receiptContent = this.createReceiptComponent(receiptData);
      const data = await render(receiptContent);

      if (this.config.connectionType === 'usb' && this.usbDevice) {
        await this.printViaUSB(data);
      } else if (this.port) {
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
    if (!this.isConnected()) {
      throw new Error('Printer not connected. Please connect to a thermal printer first.');
    }

    try {
      const testContent = (
        <Printer type={this.config.type || 'epson'} width={this.config.width || 48} debug={false}>
          <Text align="center" bold>Test Receipt</Text>
          <Line />
          <Text>This is a test print</Text>
          <Text>Printer is working correctly!</Text>
          <Text>Connection: {this.config.connectionType?.toUpperCase() || 'SERIAL'}</Text>
          <Line />
          <Text align="center">Thank you</Text>
          <Cut />
        </Printer>
      );

      const data = await render(testContent);

      if (this.config.connectionType === 'usb' && this.usbDevice) {
        await this.printViaUSB(data);
      } else if (this.port) {
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