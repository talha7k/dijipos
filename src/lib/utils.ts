import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'en-US', currency: string = 'USD'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    // Fallback to USD if the locale/currency combination is not supported
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return ''
  
  const dateObj = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

// Table status colors
export const tableStatusColors = {
  available: 'bg-green-100 text-green-800 border-green-200',
  occupied: 'bg-red-100 text-red-800 border-red-200',
  reserved: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  maintenance: 'bg-gray-100 text-gray-800 border-gray-200',
} as const;

export const tableStatusColorsSimple = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-red-100 text-red-800',
  reserved: 'bg-yellow-100 text-yellow-800',
  maintenance: 'bg-gray-100 text-gray-800',
} as const;

// Order status colors
export const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

// Invoice status colors
export const invoiceStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
} as const;

// Quote status colors
export const quoteStatusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
} as const;

// Helper functions
export function getTableStatusColor(status: string, withBorder = true) {
  return withBorder 
    ? tableStatusColors[status as keyof typeof tableStatusColors] || tableStatusColors.maintenance
    : tableStatusColorsSimple[status as keyof typeof tableStatusColorsSimple] || tableStatusColorsSimple.maintenance;
}

export function getOrderStatusColor(status: string) {
  return orderStatusColors[status as keyof typeof orderStatusColors] || orderStatusColors.pending;
}

export function getInvoiceStatusColor(status: string) {
  return invoiceStatusColors[status as keyof typeof invoiceStatusColors] || invoiceStatusColors.draft;
}

export function getQuoteStatusColor(status: string) {
  return quoteStatusColors[status as keyof typeof quoteStatusColors] || quoteStatusColors.draft;
}
