import { useMemo } from 'react';
import { useStoreSettings } from './useStoreSettings';

/**
 * Hook that provides currency formatting based on store settings
 */
export function useCurrency() {
  const { storeSettings } = useStoreSettings();

  const currencySettings = storeSettings?.currencySettings;

  const formatCurrency = useMemo(() => {
    return (amount: number): string => {
      if (!currencySettings) {
        // Default to USD if no settings are available
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }

       const { currency } = currencySettings;

       try {
         // Use English locale for numbers (Western numerals) but get currency symbol from the selected locale
         const formatter = new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: currency,
           // These options help ensure consistent formatting
           minimumFractionDigits: 2,
           maximumFractionDigits: 2,
         });

         return formatter.format(amount);
       } catch {
        // Fallback to USD if the currency is not supported with en-US locale
        console.warn(`Currency ${currency} not supported with en-US locale, falling back to USD`);
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount);
      }
    };
  }, [currencySettings]);

  const getCurrencySymbol = useMemo(() => {
    return (): string => {
      if (!currencySettings) {
        return '$';
      }

       const { currency } = currencySettings;

       try {
         // Get currency symbol from Intl.NumberFormat
         const formatter = new Intl.NumberFormat('en-US', {
           style: 'currency',
           currency: currency,
         });

         // Extract symbol from a formatted value
         const parts = formatter.formatToParts(1000);
         const currencyPart = parts.find(part => part.type === 'currency');
         return currencyPart?.value || '$';
       } catch {
        return '$';
      }
    };
  }, [currencySettings]);

  return {
    formatCurrency,
    getCurrencySymbol,
    currencySettings,
  };
}