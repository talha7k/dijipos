import { useEffect } from "react";

/**
 * Utility function to set up automatic expiry timer for selected dates
 * @param selectedDate - The currently selected date string
 * @param onExpiry - Callback function to execute when timer expires
 * @param expiryHours - Number of hours after which to expire (default: 20)
 */
export function useDateExpiryTimer(
  selectedDate: string | null,
  onExpiry: () => void,
  expiryHours: number = 20
) {
  useEffect(() => {
    if (selectedDate) {
      const timer = setTimeout(() => {
        onExpiry();
      }, expiryHours * 60 * 60 * 1000); // Convert hours to milliseconds

      return () => clearTimeout(timer);
    }
  }, [selectedDate, onExpiry, expiryHours]);
}