// Import enums from the main enums file
import { QuoteStatus, InvoiceStatus, PurchaseInvoiceStatus, InvoiceType } from './enums';

export interface Quote {
  id: string;
  organizationId: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: Item[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  organizationId: string;
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
}

export interface SalesInvoice {
  id: string;
  organizationId: string;
  type: InvoiceType.SALES;
  quoteId?: string;
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  items: Item[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate: Date;
  notes?: string;
  payments: Payment[];
}

export interface PurchaseInvoice {
  id: string;
  organizationId: string;
  type: InvoiceType.PURCHASE;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress?: string;
  supplierVAT?: string;
  items: Item[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: PurchaseInvoiceStatus; // Fixed: Use PurchaseInvoiceStatus instead of InvoiceStatus
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  notes?: string;
  includeQR: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Invoice = SalesInvoice | PurchaseInvoice;

// Import InvoiceItem from product-service types
import { InvoiceItem as Item } from './product-service';