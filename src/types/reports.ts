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
