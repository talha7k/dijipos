export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchical categories
  type: 'product' | 'service' | 'both'; // Category can be for products, services, or both
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string; // Reference to Category ID
  variations?: ProductVariation[]; // Optional variations
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number; // total price
  categoryId?: string; // Reference to Category ID
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

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
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  notes?: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  organizationId: string;
  quoteId?: string;
  type: 'sales' | 'purchase';
  clientName?: string; // For sales invoices
  clientEmail?: string; // For sales invoices
  clientAddress?: string; // For sales invoices
  clientVAT?: string; // For sales invoices
  supplierId?: string; // For purchase invoices
  supplierName?: string; // For purchase invoices
  supplierEmail?: string; // For purchase invoices
  supplierAddress?: string; // For purchase invoices
  supplierVAT?: string; // For purchase invoices
  items: Item[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoiceNumber?: string; // For purchase invoices
  invoiceDate?: Date; // For purchase invoices
  dueDate: Date;
  notes?: string;
  template: 'english' | 'arabic';
  includeQR: boolean;
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

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
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
  type: 'english' | 'arabic' | 'custom';
  isDefault: boolean;
  fields: TemplateField[];
  style: TemplateStyle;
  customCSS?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  nameAr?: string; // Arabic supplier name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  contactPerson?: string;
  logoUrl?: string; // Supplier logo URL
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  nameAr?: string; // Arabic customer name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  logoUrl?: string; // Customer logo URL
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseInvoice {
  id: string;
  organizationId: string;
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
  status: 'draft' | 'sent' | 'received' | 'partially_paid' | 'paid' | 'cancelled';
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  notes?: string;
  template: 'english' | 'arabic';
  includeQR: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Table {
  id: string;
  name: string;
  capacity: number; // Number of seats
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  type: 'product' | 'service';
  productId?: string;
  serviceId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  organizationId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'open' | 'completed' | 'cancelled' | 'saved';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId?: string;
  tableName?: string;
  orderType: string; // dine-in, take-away, delivery
  notes?: string;
  createdById: string; // ID of user who created the order
  createdByName: string; // Name of user who created the order
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderPayment {
  id: string;
  organizationId: string;
  orderId: string;
  amount: number;
  paymentMethod: string; // cash, card, online, etc.
  paymentDate: Date;
  reference?: string; // receipt number, transaction ID, etc.
  notes?: string;
  createdAt: Date;
}

export interface OrderType {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentType {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrinterSettings {
  id: string;
  paperWidth: number; // Width in mm (e.g., 48, 58, 80 for common thermal printer widths)
  fontSize: 'small' | 'medium' | 'large';
  characterPerLine: number; // Characters per line based on paper width
  autoCut: boolean;
  // Thermal printer specific settings
  printerType?: 'epson' | 'star'; // Thermal printer type
  characterSet?: string; // Character set (e.g., 'korea', 'japan', 'multilingual')
  baudRate?: number; // Serial baud rate (default: 9600)
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceiptTemplate {
  id: string;
  name: string;
  description?: string;
  type: 'thermal' | 'a4';
  content: string; // HTML template content
  isDefault: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VATSettings {
  id: string;
  rate: number; // VAT rate in percentage (e.g., 15 for 15%)
  isEnabled: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSettings {
  id: string;
  organizationId: string;
  vatSettings: VATSettings;
  orderTypes: OrderType[];
  paymentTypes: PaymentType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationUser {
  id: string;
  userId: string;
  organizationId: string;
  role: 'admin' | 'manager' | 'waiter' | 'cashier';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  nameAr?: string; // Arabic company name
  email: string;
  address?: string;
  phone?: string;
  vatNumber?: string;
  logoUrl?: string; // Company logo URL
  stampUrl?: string; // Company stamp URL
  createdAt: Date;
  updatedAt: Date;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
}