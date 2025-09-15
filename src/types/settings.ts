// Import enums from the main enums file
import { PrinterType, FontSize, PaperWidth, CHARACTER_SETS } from './enums';
import type { CharacterSet } from './enums';

export interface PrinterSettings {
  id: string;
  defaultReceiptTemplateId?: string; // ID of the default receipt template to use
  defaultInvoiceTemplateId?: string; // ID of the default invoice template to use
  defaultQuoteTemplateId?: string; // ID of the default quote template to use
  includeQRCode?: boolean; // Whether to include ZATCA QR code on receipt
  paperWidth?: number; // Paper width in mm
  fontSize?: FontSize; // Font size for printing
  characterPerLine?: number; // Characters per line
  characterSet?: CharacterSet; // Character set for printing
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

// Import types from other modules
import { OrderType, PaymentType } from './order';