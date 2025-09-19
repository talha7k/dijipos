export enum TableStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  MAINTENANCE = "maintenance",
}
// Static template IDs that cannot be modified
export const STATIC_RECEIPT_TEMPLATE_IDS = [
  "english-thermal",
  "arabic-thermal",
  "english-a4",
  "arabic-a4",
];

export const STATIC_INVOICE_TEMPLATE_IDS = [
  "english-invoice",
  "arabic-invoice",
];

export const STATIC_QUOTE_TEMPLATE_IDS = ["english-quote", "arabic-quote"];

// Template type enums for each category
export enum ReceiptTemplateType {
  ENGLISH_A4 = "english_a4",
  ENGLISH_THERMAL = "english_thermal",
  ARABIC_A4 = "arabic_a4",
  ARABIC_THERMAL = "arabic_thermal",
  CUSTOM = "custom",
}

export enum OrderStatus {
  OPEN = "open",
  COMPLETED = "completed",
  PREPARING = "preparing",
  CANCELLED = "cancelled",
  ON_HOLD = "on_hold",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  PARTIAL = "partial",
}

export enum QuoteStatus {
  DRAFT = "draft",
  SENT = "sent",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CONVERTED = "converted",
}

export enum InvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export enum PurchaseInvoiceStatus {
  DRAFT = "draft",
  SENT = "sent",
  RECEIVED = "received",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  CANCELLED = "cancelled",
}

export enum CategoryType {
  PRODUCT = "product",
  SERVICE = "service",
}

export enum ItemType {
  PRODUCT = "product",
  SERVICE = "service",
}

export enum InvoiceType {
  SALES = "sales",
  PURCHASE = "purchase",
}

export enum InvoiceTemplateType {
  ENGLISH = "english",
  ARABIC = "arabic",
  CUSTOM = "custom",
}

export enum QuoteTemplateType {
  ENGLISH = "english",
  ARABIC = "arabic",
  CUSTOM = "custom",
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  WAITER = "waiter",
  CASHIER = "cashier",
}

export enum TemplateFieldType {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  SELECT = "select",
  DATE = "date",
}

export enum PrinterType {
  EPSON = "epson",
  STAR = "star",
}

export enum FontSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum PrinterFormat {
  THERMAL = "thermal",
  A4 = "a4",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TRIAL = "trial",
}
// Currency and Locale enums for settings
export enum Currency {
  SAR = "SAR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  KWD = "KWD",
  BHD = "BHD",
  OMR = "OMR",
  QAR = "QAR",
}

export enum CurrencyLocale {
  AR_SA = "ar-SA", // Arabic - Saudi Arabia
  EN_US = "en-US", // English - United States
  EN_GB = "en-GB", // English - United Kingdom
  DE_DE = "de-DE", // German - Germany
  FR_FR = "fr-FR", // French - France
  AR_AE = "ar-AE", // Arabic - UAE
  AR_KW = "ar-KW", // Arabic - Kuwait
  AR_BH = "ar-BH", // Arabic - Bahrain
  AR_OM = "ar-OM", // Arabic - Oman
  AR_QA = "ar-QA", // Arabic - Qatar
}

// Order Status Colors for UI indicators
export enum OrderStatusColor {
  OPEN = "yellow", // Yellow for pending/open orders
  PREPARING = "orange", // Orange for orders being prepared
  COMPLETED = "green", // Green for completed orders
  CANCELLED = "red", // Red for cancelled orders
  ON_HOLD = "gray", // Gray for orders on hold
}

// Color mappings for different statuses
export const ORDER_STATUS_COLORS = {
  [OrderStatus.OPEN]: OrderStatusColor.OPEN,
  [OrderStatus.PREPARING]: OrderStatusColor.PREPARING,
  [OrderStatus.COMPLETED]: OrderStatusColor.COMPLETED,
  [OrderStatus.CANCELLED]: OrderStatusColor.CANCELLED,
  [OrderStatus.ON_HOLD]: OrderStatusColor.ON_HOLD,
} as const;

export const QUOTE_STATUS_COLORS = {
  [QuoteStatus.DRAFT]: "gray",
  [QuoteStatus.SENT]: "blue",
  [QuoteStatus.ACCEPTED]: "green",
  [QuoteStatus.REJECTED]: "red",
  [QuoteStatus.EXPIRED]: "orange",
  [QuoteStatus.CONVERTED]: "purple",
} as const;

export const INVOICE_STATUS_COLORS = {
  [InvoiceStatus.DRAFT]: "gray",
  [InvoiceStatus.SENT]: "blue",
  [InvoiceStatus.PAID]: "green",
  [InvoiceStatus.OVERDUE]: "red",
  [InvoiceStatus.CANCELLED]: "orange",
} as const;

export const PURCHASE_INVOICE_STATUS_COLORS = {
  [PurchaseInvoiceStatus.DRAFT]: "gray",
  [PurchaseInvoiceStatus.SENT]: "blue",
  [PurchaseInvoiceStatus.RECEIVED]: "yellow",
  [PurchaseInvoiceStatus.PARTIALLY_PAID]: "orange",
  [PurchaseInvoiceStatus.PAID]: "green",
  [PurchaseInvoiceStatus.CANCELLED]: "red",
} as const;

// Table Status Colors
export const TABLE_STATUS_COLORS = {
  [TableStatus.AVAILABLE]: "green",
  [TableStatus.OCCUPIED]: "red",
  [TableStatus.RESERVED]: "yellow",
  [TableStatus.MAINTENANCE]: "gray",
} as const;

// Utility functions for getting status colors
export function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status];
}

export function getQuoteStatusColor(status: QuoteStatus): string {
  return QUOTE_STATUS_COLORS[status];
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  return INVOICE_STATUS_COLORS[status];
}

export function getPurchaseInvoiceStatusColor(
  status: PurchaseInvoiceStatus,
): string {
  return PURCHASE_INVOICE_STATUS_COLORS[status];
}

export function getTableStatusColor(status: TableStatus): string {
  return TABLE_STATUS_COLORS[status];
}

// Button variant mappings for status colors
export const ORDER_STATUS_BUTTON_VARIANTS = {
  [OrderStatus.OPEN]: "yellow",
  [OrderStatus.PREPARING]: "orange",
  [OrderStatus.COMPLETED]: "green",
  [OrderStatus.CANCELLED]: "danger",
  [OrderStatus.ON_HOLD]: "secondary",
} as const;

export const QUOTE_STATUS_BUTTON_VARIANTS = {
  [QuoteStatus.DRAFT]: "secondary",
  [QuoteStatus.SENT]: "primary",
  [QuoteStatus.ACCEPTED]: "success",
  [QuoteStatus.REJECTED]: "danger",
  [QuoteStatus.EXPIRED]: "warning",
  [QuoteStatus.CONVERTED]: "purple",
} as const;

export const INVOICE_STATUS_BUTTON_VARIANTS = {
  [InvoiceStatus.DRAFT]: "secondary",
  [InvoiceStatus.SENT]: "primary",
  [InvoiceStatus.PAID]: "success",
  [InvoiceStatus.OVERDUE]: "danger",
  [InvoiceStatus.CANCELLED]: "warning",
} as const;
