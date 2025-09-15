export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string; // For hierarchical categories
  type: CategoryType; // Category can be for products, services, or both
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
  type: ItemType;
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
  status: QuoteStatus;
  notes?: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  organizationId: string;
  quoteId?: string;
  type: InvoiceType;
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
  status: InvoiceStatus;
  invoiceNumber?: string; // For purchase invoices
  invoiceDate?: Date; // For purchase invoices
  dueDate: Date;
  notes?: string;
  template: TemplateType;
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

export interface InvitationCode {
  id: string;
  code: string;
  organizationId: string;
  role: UserRole;
  expiresAt: Date;
  isUsed: boolean;
  usedBy?: string;
  createdAt: Date;
}

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
  type: TemplateType;
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
  status: PurchaseInvoiceStatus;
  invoiceNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  notes?: string;
  template: TemplateType;
  includeQR: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance'
}

export enum OrderStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
  PREPARING = 'preparing',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold'
}

export enum QuoteStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum PurchaseInvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum CategoryType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export enum ItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

export enum InvoiceType {
  SALES = 'sales',
  PURCHASE = 'purchase'
}

export enum TemplateType {
  ENGLISH = 'english',
  ARABIC = 'arabic',
  CUSTOM = 'custom'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  WAITER = 'waiter',
  CASHIER = 'cashier'
}

export enum TemplateFieldType {
  TEXT = 'text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  DATE = 'date'
}

export enum PrinterType {
  EPSON = 'epson',
  STAR = 'star'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum PrinterFormat {
  THERMAL = 'thermal',
  A4 = 'a4'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRIAL = 'trial'
}

export interface Table {
  id: string;
  name: string;
  capacity: number; // Number of seats
  status: TableStatus;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  type: ItemType;
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
  status: OrderStatus;
  paid: boolean; // Whether the order has been fully paid
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  tableId?: string;
  tableName?: string;
  orderType: string; // dine-in, take-away, delivery
  notes?: string;
  includeQR?: boolean; // Whether to include ZATCA QR code on receipt
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
  defaultReceiptTemplateId?: string; // ID of the default receipt template to use
  defaultInvoiceTemplateId?: string; // ID of the default invoice template to use
  defaultQuoteTemplateId?: string; // ID of the default quote template to use
  includeQRCode?: boolean; // Whether to include ZATCA QR code on receipt
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Add new enums for thermal printer configuration
export enum PaperWidth {
  MM_48 = 48,
  MM_58 = 58,
  MM_80 = 80,
  MM_82 = 82,
  MM_112 = 112
}

// Character set constants - already exists but keeping for reference
export const CHARACTER_SETS = {
  MULTILINGUAL: 'multilingual',
  KOREA: 'korea',
  JAPAN: 'japan',
  USA: 'usa',
} as const;

export type CharacterSet = typeof CHARACTER_SETS[keyof typeof CHARACTER_SETS];

export interface ReceiptTemplate {
  id: string;
  name: string;
  description?: string;
  type: PrinterFormat;
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
  role: UserRole;
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
  subscriptionStatus: SubscriptionStatus;
}