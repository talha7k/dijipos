import React from 'react';
import { Printer, Text, Line, Cut, render, Row, PrinterType } from 'react-thermal-printer';
import { Order, Tenant } from '@/types';

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

export interface ThermalPrinterConfig {
  type?: PrinterType;
  width?: number;
  characterSet?: string;
  baudRate?: number;
}

export interface ReceiptData {
  order: Order;
  tenant: Tenant | null;
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

export class ThermalPrinterService {
  private port: SerialPort | null = null;
  private connectedPrinter: ConnectedPrinter | null = null;
  private config: ThermalPrinterConfig = {
    type: 'epson',
    width: 48,
    characterSet: 'korea',
    baudRate: 9600,
  };

  /**
   * Get previously connected printers
   */
  async getConnectedPrinters(): Promise<ConnectedPrinter[]> {
    try {
      if (!(navigator as NavigatorWithSerial).serial) {
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
    if (this.port) {
      try {
        await this.port.close();
        this.port = null;
        this.connectedPrinter = null;
        console.log('Disconnected from thermal printer');
      } catch (error) {
        console.error('Error disconnecting from thermal printer:', error);
      }
    }
  }

  /**
   * Check if printer is connected
   */
  isConnected(): boolean {
    return this.port !== null;
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
    if (!this.port) {
      throw new Error('Printer not connected. Please connect to a thermal printer first.');
    }

    try {
      const receiptContent = this.createReceiptComponent(receiptData);
      const data = await render(receiptContent);

      const writer = this.port.writable?.getWriter();
      if (!writer) {
        throw new Error('Unable to get writer for thermal printer');
      }

      await writer.write(data);
      await writer.close();

      console.log('Receipt printed successfully');
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw new Error('Failed to print receipt. Please check printer connection.');
    }
  }

  /**
   * Create the receipt React component
   */
  private createReceiptComponent({ order, tenant }: ReceiptData) {
    return (
      <Printer
        type={this.config.type || 'epson'}
        width={this.config.width || 48}
        debug={false}
      >
        {/* Company Header */}
        <Text align="center" bold>{tenant?.name || ''}</Text>
        <Text align="center">{tenant?.address || ''}</Text>
        <Text align="center">Tel: {tenant?.phone || ''}</Text>
        {tenant?.vatNumber && <Text align="center">VAT: {tenant.vatNumber}</Text>}
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
    if (!this.port) {
      throw new Error('Printer not connected. Please connect to a thermal printer first.');
    }

    try {
      const testContent = (
        <Printer type={this.config.type || 'epson'} width={this.config.width || 48} debug={false}>
          <Text align="center" bold>Test Receipt</Text>
          <Line />
          <Text>This is a test print</Text>
          <Text>Printer is working correctly!</Text>
          <Line />
          <Text align="center">Thank you</Text>
          <Cut />
        </Printer>
      );

      const data = await render(testContent);
      const writer = this.port.writable?.getWriter();

      if (!writer) {
        throw new Error('Unable to get writer for thermal printer');
      }

      await writer.write(data);
      await writer.close();

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