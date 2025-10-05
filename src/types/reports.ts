export interface PosReportData {
  totalSales: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  salesByPaymentType: Record<string, number>;
  salesByOrderType: Record<string, number>;
  topSellingItems: Array<{ name: string; quantity: number; total: number }>;
  totalSubtotal: number;
  totalTax: number;
  ordersByStatus: Record<string, number>;
  totalCommission?: number;
}

export interface InvoiceReportData {
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  totalOverdueAmount: number;
  totalTaxAmount: number;
  totalSubtotal: number;
  averageInvoiceValue: number;
  invoicesByStatus: Record<string, number>;
  invoicesByPaymentMethod: Record<string, number>;
  topCustomers: Array<{ name: string; invoiceCount: number; totalAmount: number }>;
  topSellingItems: Array<{ name: string; quantity: number; total: number }>;
  paymentStatus: {
    paid: number;
    unpaid: number;
    partiallyPaid: number;
    overdue: number;
  };
  agingReport: {
    current: number;
    days1_30: number;
    days31_60: number;
    days61_90: number;
    over90: number;
  };
}
