// Import enums from the main enums file
import { FontSize, Currency, CurrencyLocale } from "./enums";

// Document-specific print settings
export interface DocumentPrintSettings {
  // Template selection
  defaultTemplateId?: string;

  // Spacing (in mm)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;

  // Printer settings (document-specific)
  includeQRCode?: boolean; // Whether to include ZATCA QR code (mainly receipts)
  paperWidth?: number; // Paper width in mm
  fontSize?: FontSize; // Base font size

  // Font settings (all document types)
  headingFont?: string; // Font family for headings
  bodyFont?: string; // Font family for body text

  // Receipt-specific settings
  lineSpacing?: number; // Line spacing (receipts only)
  autoPrint?: boolean; // Auto-open print dialog after transaction (receipts only)
}

export interface PrinterSettings {
  id: string;

  // Document-specific settings only
  receipts?: DocumentPrintSettings;
  invoices?: DocumentPrintSettings;
  quotes?: DocumentPrintSettings;

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

export interface CurrencySettings {
  id: string;
  locale: CurrencyLocale; // e.g., CurrencyLocale.AR_SA, CurrencyLocale.EN_US
  currency: Currency; // e.g., Currency.SAR, Currency.USD
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreSettings {
  id: string;
  organizationId: string;
  vatSettings: VATSettings;
  currencySettings: CurrencySettings;
  orderTypes: OrderType[];
  paymentTypes: PaymentType[];
  createdAt: Date;
  updatedAt: Date;
}

// Import types from other modules
import { OrderType, PaymentType } from "./pos-order";
