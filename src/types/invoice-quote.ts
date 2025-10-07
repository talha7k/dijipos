// Import enums from the main enums file
import { InvoiceStatus, PurchaseInvoiceStatus, InvoiceType } from './enums';

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
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  clientVAT?: string;
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
  payments: Payment[];
 }

// Type guard functions
export function isSalesInvoice(invoice: SalesInvoice | PurchaseInvoice): invoice is SalesInvoice {
  return invoice.type === InvoiceType.SALES;
}

export function isPurchaseInvoice(invoice: SalesInvoice | PurchaseInvoice): invoice is PurchaseInvoice {
  return invoice.type === InvoiceType.PURCHASE;
}

// Import InvoiceItem from product-service types
import { InvoiceItem as Item } from './product-service';
