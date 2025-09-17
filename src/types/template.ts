// Import enums from the main enums file
import { QuoteTemplateType, InvoiceTemplateType, ReceiptTemplateType, TemplateFieldType, PrinterFormat } from './enums';



export interface TemplateField {
  id: string;
  name: string;
  type: TemplateFieldType;
  label: string;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select type
  required: boolean;
  visible: boolean;
}

export interface TemplateStyle {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  logoUrl?: string;
  showLogo: boolean;
  showWatermark: boolean;
  watermarkText?: string;
}

export interface InvoiceTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: InvoiceTemplateType;
  isDefault: boolean;
  fields: TemplateField[];
  style: TemplateStyle;
  customCSS?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuoteTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: QuoteTemplateType;
  isDefault: boolean;
  fields: TemplateField[];
  style: TemplateStyle;
  customCSS?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  description?: string;
  type: ReceiptTemplateType;
  content: string; // HTML template content
  customHeader?: string;
  customFooter?: string;
  isDefault: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptTemplateData {
  companyName: string;
  companyNameAr: string;
  companyAddress: string;
  companyPhone: string;
  companyVat: string;
  companyLogo: string;
  orderNumber: string;
  queueNumber?: string;
  orderDate: string;
  tableName: string;
  customerName: string;
  createdByName: string;
  orderType: string;
  paymentMethod: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  customHeader?: string;
  customFooter?: string;
  totalQty: number;
  paperWidth?: number; // Paper width in mm for dynamic layout
  items: Array<{
    name: string;
    quantity: number;
    total: string;
  }>;
  payments: Array<{
    paymentType: string;
    amount: string;
  }>;
  includeQR: boolean;
  qrCodeUrl?: string;
}

export interface InvoiceTemplateData {
  invoiceId: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  companyName: string;
  companyNameAr: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyVat: string;
  companyLogo: string;
  companyStamp: string;
  clientName: string;
  customerNameAr: string;
  clientAddress: string;
  clientEmail: string;
  clientVat: string;
  customerLogo: string;
  supplierName: string;
  supplierNameAr: string;
  supplierAddress: string;
  supplierEmail: string;
  supplierVat: string;
  supplierLogo: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes: string;
  includeQR: boolean;
  qrCodeUrl?: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

export interface QuoteTemplateData {
  quoteId: string;
  quoteDate: string;
  validUntil: string;
  status: string;
  companyName: string;
  companyNameAr: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyVat: string;
  companyLogo: string;
  clientName: string;
  customerNameAr: string;
  clientAddress: string;
  clientEmail: string;
  clientVat: string;
  customerLogo: string;
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  notes: string;
  includeQR: boolean;
  qrCodeUrl?: string;
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }>;
}

export type TemplateData = ReceiptTemplateData | InvoiceTemplateData | QuoteTemplateData;

// Template categories
export enum TemplateCategory {
  RECEIPT = 'receipt',
  INVOICE = 'invoice',
  QUOTE = 'quote'
}

// Unified template interface
export interface UnifiedTemplate {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  type: string; // Will be the specific type like 'thermal', 'a4', etc.
  content: string;
  customHeader?: string;
  customFooter?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Union type for all template types
export type TemplateType = ReceiptTemplate | InvoiceTemplate | QuoteTemplate;