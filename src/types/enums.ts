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

export enum QuoteTemplateType {
  ENGLISH = 'english',
  ARABIC = 'arabic'
}

export enum InvoiceTemplateType {
  ENGLISH = 'english',
  ARABIC = 'arabic',
  CUSTOM = 'custom'
}

export enum ReceiptTemplateType {
  ENGLISH_A4 = 'english_a4',
  ENGLISH_THERMAL = 'english_thermal',
  ARABIC_A4 = 'arabic_a4',
  ARABIC_THERMAL = 'arabic_thermal'
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

// Currency and Locale enums for settings
export enum Currency {
  SAR = 'SAR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AED = 'AED',
  KWD = 'KWD',
  BHD = 'BHD',
  OMR = 'OMR',
  QAR = 'QAR'
}

export enum CurrencyLocale {
  AR_SA = 'ar-SA', // Arabic - Saudi Arabia
  EN_US = 'en-US', // English - United States
  EN_GB = 'en-GB', // English - United Kingdom
  DE_DE = 'de-DE', // German - Germany
  FR_FR = 'fr-FR', // French - France
  AR_AE = 'ar-AE', // Arabic - UAE
  AR_KW = 'ar-KW', // Arabic - Kuwait
  AR_BH = 'ar-BH', // Arabic - Bahrain
  AR_OM = 'ar-OM', // Arabic - Oman
  AR_QA = 'ar-QA'  // Arabic - Qatar
}