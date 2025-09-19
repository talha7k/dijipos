/**
 * VAT Calculator utilities for handling both VAT exclusive and inclusive pricing
 */

export interface VATCalculationResult {
  subtotal: number;
  vatAmount: number;
  total: number;
}

export interface PriceBreakdown {
  basePrice: number;
  vatAmount: number;
  totalPrice: number;
}

/**
 * Calculate VAT when prices are VAT exclusive (traditional method)
 * @param subtotal - The amount before VAT
 * @param vatRate - VAT rate as percentage (e.g., 15 for 15%)
 * @returns Object with subtotal, vatAmount, and total
 */
export function calculateVATExclusive(subtotal: number, vatRate: number): VATCalculationResult {
  const vatAmount = (subtotal * vatRate) / 100;
  const total = subtotal + vatAmount;
  
  return {
    subtotal,
    vatAmount,
    total
  };
}

/**
 * Calculate VAT when prices are VAT inclusive (reverse calculation)
 * @param total - The total amount including VAT
 * @param vatRate - VAT rate as percentage (e.g., 15 for 15%)
 * @returns Object with subtotal, vatAmount, and total
 */
export function calculateVATInclusive(total: number, vatRate: number): VATCalculationResult {
  const vatAmount = total * (vatRate / (100 + vatRate));
  const subtotal = total - vatAmount;
  
  return {
    subtotal,
    vatAmount,
    total
  };
}

/**
 * Calculate price breakdown based on pricing mode
 * @param price - The price (either exclusive or inclusive based on isInclusive)
 * @param vatRate - VAT rate as percentage (e.g., 15 for 15%)
 * @param isInclusive - Whether the price includes VAT
 * @returns Object with basePrice, vatAmount, and totalPrice
 */
export function calculateFromPrice(price: number, vatRate: number, isInclusive: boolean): PriceBreakdown {
  if (isInclusive) {
    // Price includes VAT, need to extract base price
    const vatAmount = price * (vatRate / (100 + vatRate));
    const basePrice = price - vatAmount;
    
    return {
      basePrice,
      vatAmount,
      totalPrice: price
    };
  } else {
    // Price is exclusive, need to add VAT
    const vatAmount = (price * vatRate) / 100;
    const totalPrice = price + vatAmount;
    
    return {
      basePrice: price,
      vatAmount,
      totalPrice
    };
  }
}

/**
 * Calculate cart totals based on VAT settings
 * @param items - Array of cart items with their prices
 * @param vatRate - VAT rate as percentage
 * @param isInclusive - Whether prices are VAT inclusive
 * @returns Object with subtotal, vatAmount, and total
 */
export function calculateCartTotals(
  items: Array<{ price: number; quantity: number }>,
  vatRate: number,
  isInclusive: boolean
): VATCalculationResult {
  if (isInclusive) {
    // Sum of all item prices (which include VAT)
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return calculateVATInclusive(total, vatRate);
  } else {
    // Sum of all item prices (excluding VAT)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return calculateVATExclusive(subtotal, vatRate);
  }
}

/**
 * Format currency with VAT indication
 * @param amount - The amount to format
 * @param isInclusive - Whether the amount includes VAT
 * @param currency - Currency code
 * @param locale - Locale for formatting
 * @returns Formatted string with VAT indication if applicable
 */
export function formatVATPrice(
  amount: number,
  isInclusive: boolean,
  currency: string = 'SAR',
  locale: string = 'ar-SA'
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);

  return isInclusive ? `${formatted} *` : formatted;
}

/**
 * Get VAT indication text for UI
 * @param isInclusive - Whether pricing is VAT inclusive
 * @returns Text indicating VAT inclusion
 */
export function getVATIndicationText(isInclusive: boolean): string {
  return isInclusive ? '* Prices include VAT' : '+ VAT will be added';
}