export enum TableStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  MAINTENANCE = "maintenance",
}




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
export enum InvoiceType {
  SALES = "sales",
  PURCHASE = "purchase",
}



export enum InvoiceStatus {
  DRAFT = "draft",
  QUOTE = "quote",
  SENT = "sent",
  WAITING_PAYMENT = "waiting_payment",
  PARTIALLY_PAID = "partially_paid",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

// Static template IDs for built-in templates
export const STATIC_INVOICE_TEMPLATE_IDS = [
  "invoice-simple-en",
  "invoice-detailed-en", 
  "invoice-simple-ar",
  "invoice-detailed-ar"
] as const;

export const STATIC_RECEIPT_TEMPLATE_IDS = [
  "receipt-simple-en",
  "receipt-detailed-en",
  "receipt-simple-ar", 
  "receipt-detailed-ar"
] as const;

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



export enum ProductTransactionType {
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
  OWNER = "owner",
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
  EXPIRED = "expired",
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



export const INVOICE_STATUS_COLORS = {
  [InvoiceStatus.DRAFT]: "gray",
  [InvoiceStatus.QUOTE]: "purple",
  [InvoiceStatus.SENT]: "blue",
  [InvoiceStatus.WAITING_PAYMENT]: "yellow",
  [InvoiceStatus.PARTIALLY_PAID]: "orange",
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



export const INVOICE_STATUS_BUTTON_VARIANTS = {
  [InvoiceStatus.DRAFT]: "secondary",
  [InvoiceStatus.QUOTE]: "purple",
  [InvoiceStatus.SENT]: "primary",
  [InvoiceStatus.WAITING_PAYMENT]: "warning",
  [InvoiceStatus.PARTIALLY_PAID]: "orange",
  [InvoiceStatus.PAID]: "success",
  [InvoiceStatus.OVERDUE]: "danger",
  [InvoiceStatus.CANCELLED]: "warning",
} as const;
