// Import enums from the main enums file
import { PrinterType, FontSize, PaperWidth, CHARACTER_SETS, Currency, CurrencyLocale } from './enums';
import type { CharacterSet } from './enums';

// Document-specific print settings
export interface DocumentPrintSettings {
  // Template selection
  defaultTemplateId?: string;

  // Margins (in mm)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  // Padding (in mm)
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}

export interface PrinterSettings {
  id: string;
  includeQRCode?: boolean; // Whether to include ZATCA QR code on receipt
  paperWidth?: number; // Paper width in mm
  fontSize?: FontSize; // Font size for printing
  characterPerLine?: number; // Characters per line
  characterSet?: CharacterSet; // Character set for printing

  // Document-specific settings
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
import { OrderType, PaymentType } from './order';