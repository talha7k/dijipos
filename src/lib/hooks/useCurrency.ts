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

      const { locale, currency } = currencySettings;

      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
        }).format(amount);
      } catch (error) {
        // Fallback to USD if the locale/currency combination is not supported
        console.warn(`Unsupported locale/currency combination: ${locale}/${currency}, falling back to USD`);
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

      const { locale, currency } = currencySettings;

      try {
        // Get currency symbol from Intl.NumberFormat
        const formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currency,
        });

        // Extract symbol from a formatted value
        const parts = formatter.formatToParts(1000);
        const currencyPart = parts.find(part => part.type === 'currency');
        return currencyPart?.value || '$';
      } catch (error) {
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