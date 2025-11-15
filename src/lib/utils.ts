import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  locale: string = "en-US",
  currency: string = "USD",
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  } catch {
    // Fallback to USD if the locale/currency combination is not supported
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

export function formatDate(
  date: Date | string | number | null | undefined | { seconds: number; nanoseconds: number },
): string {
  if (!date) return "";

  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'object' && date !== null && 'seconds' in date && 'nanoseconds' in date) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    dateObj = new Date(date as string | number);
  }

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(dateObj);
}

export function formatDateTime(
  date: Date | string | number | null | undefined,
  includeTime: boolean = true,
): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date);

  if (includeTime) {
    const dateStr = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);

    const timeStr = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);

    return `${dateStr} (${timeStr.toUpperCase()})`;
  }

  return formatDate(dateObj);
}

// Table status colors
export const tableStatusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  occupied: "bg-red-100 text-red-800 border-red-200",
  reserved: "bg-yellow-100 text-yellow-800 border-yellow-200",
  maintenance: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

export const tableStatusColorsSimple = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-red-100 text-red-800",
  reserved: "bg-yellow-100 text-yellow-800",
  maintenance: "bg-gray-100 text-gray-800",
} as const;

// Order status colors
export const orderStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
} as const;

// Invoice status colors
export const invoiceStatusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const;



// Helper functions
export function getTableStatusColor(status: string, withBorder = true) {
  return withBorder
    ? tableStatusColors[status as keyof typeof tableStatusColors] ||
        tableStatusColors.maintenance
    : tableStatusColorsSimple[status as keyof typeof tableStatusColorsSimple] ||
        tableStatusColorsSimple.maintenance;
}

export function getOrderStatusColor(status: string) {
  return (
    orderStatusColors[status as keyof typeof orderStatusColors] ||
    orderStatusColors.pending
  );
}

export function getInvoiceStatusColor(status: string) {
  return (
    invoiceStatusColors[status as keyof typeof invoiceStatusColors] ||
    invoiceStatusColors.draft
  );
}



// Text length utilities based on character count

// Centralized display length constants
export const CHAR_DISPLAY_LENGTHS = {
  SHORT: 20, // For indentifying legth of text isLongName
  MEDIUM: 60, // For moderate displays (tables, forms) for truncating.
  LONG: 100, // For detailed displays (descriptions, notes)
  XL: 200, // For very long text (full content)
} as const;

// Helper function to get display length by type
export function getDisplayLength(
  type: "short" | "medium" | "long" | "xl" = "short",
): number {
  return CHAR_DISPLAY_LENGTHS[
    type.toUpperCase() as keyof typeof CHAR_DISPLAY_LENGTHS
  ];
}

export function isTextTooLong(
  text: string | null | undefined,
  maxLength: number,
): boolean {
  if (!text) return false;
  return text.length > maxLength;
}

export function truncateText(
  text: string | null | undefined,
  maxLength: number,
  suffix: string = "...",
): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// Convenience function using centralized lengths
export function truncateTextByType(
  text: string | null | undefined,
  type: "short" | "medium" | "long" | "xl" = "short",
  suffix: string = "...",
): string {
  const maxLength = getDisplayLength(type);
  return truncateText(text, maxLength, suffix);
}

export function validateTextLength(
  text: string | null | undefined,
  minLength: number = 0,
  maxLength: number = Infinity,
): {
  isValid: boolean;
  isTooShort: boolean;
  isTooLong: boolean;
  length: number;
} {
  const length = text?.length || 0;
  const isTooShort = length < minLength;
  const isTooLong = length > maxLength;
  const isValid = !isTooShort && !isTooLong;

  return {
    isValid,
    isTooShort,
    isTooLong,
    length,
  };
}
