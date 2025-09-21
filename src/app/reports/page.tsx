"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Download, FileText, Receipt } from "lucide-react";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { useOrders } from "@/lib/hooks/useOrders";
import { AdminManagerGuard } from "@/components/layout/RoleGuard";
import { format } from "date-fns";
import { PaymentStatus } from "@/types";
import { OrderStatus } from "@/types";
import { Loader } from "@/components/ui/loader";

interface PosReportData {
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
}

function PosReportDetails({ data }: { data: PosReportData }) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalSales.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalItemsSold}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageOrderValue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Payment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.salesByPaymentType).map(
                  ([type, amount]) => (
                    <TableRow key={type}>
                      <TableCell className="capitalize">{type}</TableCell>
                      <TableCell className="text-right">
                        {amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales by Order Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.salesByOrderType).map(([type, amount]) => (
                  <TableRow key={type}>
                    <TableCell className="capitalize">{type}</TableCell>
                    <TableCell className="text-right">
                      {amount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topSellingItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.ordersByStatus).map(([status, count]) => (
                <TableRow key={status}>
                  <TableCell className="capitalize">
                    {status.replace("_", " ")}
                  </TableCell>
                  <TableCell className="text-right">{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Subtotal (before VAT)</TableCell>
                <TableCell className="text-right">
                  {data.totalSubtotal.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total VAT Collected</TableCell>
                <TableCell className="text-right">
                  {data.totalTax.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Total Sales</TableCell>
                <TableCell className="text-right">
                  {data.totalSales.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function generateReportHtml(
  data: PosReportData,
  reportDate: Date,
  dateFilterType: string,
  isDetailed: boolean,
) {
  const title = `POS Sales Report - ${format(reportDate, "PPP")} (${dateFilterType === "selectedDate" ? "Business Date" : "Order Date"})`;
  const detailsHtml = isDetailed
    ? `
    <h2>Sales by Payment Type</h2>
    <table>
      <thead><tr><th>Type</th><th class="text-right">Amount</th></tr></thead>
      <tbody>
        ${Object.entries(data.salesByPaymentType)
          .map(
            ([type, amount]) =>
              `<tr><td class="capitalize">${type}</td><td class="text-right">${amount.toFixed(2)}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>

    <h2>Sales by Order Type</h2>
    <table>
      <thead><tr><th>Type</th><th class="text-right">Amount</th></tr></thead>
      <tbody>
        ${Object.entries(data.salesByOrderType)
          .map(
            ([type, amount]) =>
              `<tr><td class="capitalize">${type}</td><td class="text-right">${amount.toFixed(2)}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>

    <h2>Top Selling Items</h2>
    <table>
      <thead><tr><th>Item</th><th class="text-right">Quantity</th><th class="text-right">Total</th></tr></thead>
      <tbody>
        ${data.topSellingItems.map((item) => `<tr><td>${item.name}</td><td class="text-right">${item.quantity}</td><td class="text-right">${item.total.toFixed(2)}</td></tr>`).join("")}
      </tbody>
    </table>

    <h2>Orders by Status</h2>
    <table>
      <thead><tr><th>Status</th><th class="text-right">Count</th></tr></thead>
      <tbody>
        ${Object.entries(data.ordersByStatus)
          .map(
            ([status, count]) =>
              `<tr><td class="capitalize">${status.replace("_", " ")}</td><td class="text-right">${count}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `
    : "";

  return `
    <style>
      body { font-family: sans-serif; margin: 20px; }
      h1, h2 { color: #333; }
      h1 { font-size: 24px; text-align: center; margin-bottom: 20px; }
      h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f9f9f9; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 20px; }
      .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
      .card-title { font-weight: bold; margin-bottom: 10px; }
      .text-2xl { font-size: 24px; font-weight: bold; }
      .text-right { text-align: right; }
      .capitalize { text-transform: capitalize; }
    </style>
    <h1>${title}</h1>

    <div class="grid">
      <div class="card">
        <div class="card-title">Total Sales</div>
        <div class="text-2xl">${data.totalSales.toFixed(2)}</div>
      </div>
      <div class="card">
        <div class="card-title">Total Orders</div>
        <div class="text-2xl">${data.totalOrders}</div>
      </div>
      <div class="card">
        <div class="card-title">Items Sold</div>
        <div class="text-2xl">${data.totalItemsSold}</div>
      </div>
      <div class="card">
        <div class="card-title">Avg. Order Value</div>
        <div class="text-2xl">${data.averageOrderValue.toFixed(2)}</div>
      </div>
    </div>

    ${detailsHtml}

    <h2>Financial Summary</h2>
    <table>
      <tbody>
        <tr><td>Subtotal (before VAT)</td><td class="text-right">${data.totalSubtotal.toFixed(2)}</td></tr>
        <tr><td>Total VAT Collected</td><td class="text-right">${data.totalTax.toFixed(2)}</td></tr>
        <tr><td style="font-weight: bold;">Total Sales</td><td class="text-right" style="font-weight: bold;">${data.totalSales.toFixed(2)}</td></tr>
      </tbody>
    </table>
  `;
}

import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";

function PosReportTab({
  title,
  data,
  date,
  onDateChange,
  dateFilterType,
  onDateFilterTypeChange,
  isDetailed,
  onPrint,
  reportHtml,
  printDialogOpen,
  setPrintDialogOpen,
}: {
  title: string;
  data: PosReportData;
  date: Date;
  onDateChange: (date: Date) => void;
  dateFilterType: string;
  onDateFilterTypeChange: (value: string) => void;
  isDetailed: boolean;
  onPrint: () => void;
  reportHtml: string;
  printDialogOpen: boolean;
  setPrintDialogOpen: (open: boolean) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <DatePicker onDateChange={onDateChange}>
            <Button variant="outline">{format(date, "PPP")}</Button>
          </DatePicker>
          <Select value={dateFilterType} onValueChange={onDateFilterTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="selectedDate">Business Date</SelectItem>
              <SelectItem value="createdAt">Order Date</SelectItem>
            </SelectContent>
          </Select>
          <ReceiptPrintDialog
            rawHtml={reportHtml}
            title={`POS Sales Report - ${format(date, "PPP")}`}
            onOpenChange={setPrintDialogOpen}
          >
            <Button onClick={onPrint}>
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>
          </ReceiptPrintDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isDetailed ? (
          <PosReportDetails data={data} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Total Sales</TableCell>
                <TableCell className="text-right">
                  {data.totalSales.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Tax</TableCell>
                <TableCell className="text-right">
                  {data.totalTax.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsPage() {
  const { salesInvoices, loading: invoicesLoading } = useInvoices();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { orders, loading: ordersLoading, getPaymentsForOrder } = useOrders();

  // Log initial data load
  useEffect(() => {
    console.log("📊 [REPORTS DEBUG] Component mounted - initial data:", {
      orders,
      ordersLoading,
      invoicesLoading,
      quotesLoading,
    });
  }, [orders, ordersLoading, invoicesLoading, quotesLoading]);

  // Log when orders data changes
  useEffect(() => {
    console.log("📊 [REPORTS DEBUG] Orders data updated:", orders);
  }, [orders]);

  const [posReportDate, setPosReportDate] = useState<Date>(new Date());
  const [dateFilterType, setDateFilterType] = useState("selectedDate");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [reportHtml, setReportHtml] = useState("");

  const [paymentsByOrder, setPaymentsByOrder] = useState<
    Record<string, Array<{ paymentMethod: string; amount: number }>>
  >({});

  // Filter orders for completed orders only (for sales calculations)
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      // Date filter
      const dateToCompare =
        dateFilterType === "selectedDate"
          ? order.selectedDate
            ? new Date(order.selectedDate)
            : null
          : order.createdAt;
      if (
        !dateToCompare ||
        dateToCompare.toDateString() !== posReportDate.toDateString()
      ) {
        return false;
      }

      // Order status filter - only completed orders for calculations
      return order.status === OrderStatus.COMPLETED;
    });

    console.log("📊 [REPORTS DEBUG] Raw orders data:", orders);
    console.log(
      "📊 [REPORTS DEBUG] Filtered orders (completed only):",
      filtered,
    );
    console.log("📊 [REPORTS DEBUG] Date filter type:", dateFilterType);
    console.log(
      "📊 [REPORTS DEBUG] Report date:",
      posReportDate.toDateString(),
    );

    return filtered;
  }, [orders, posReportDate, dateFilterType]);

  // Filter all orders for the selected date (for payments and status tracking)
  const allOrdersForDate = useMemo(() => {
    const allForDate = orders.filter((order) => {
      const dateToCompare =
        dateFilterType === "selectedDate"
          ? order.selectedDate
            ? new Date(order.selectedDate)
            : null
          : order.createdAt;
      return (
        dateToCompare &&
        dateToCompare.toDateString() === posReportDate.toDateString()
      );
    });

    console.log(
      "📊 [REPORTS DEBUG] All orders for date (including non-completed):",
      allForDate,
    );

    return allForDate;
  }, [orders, posReportDate, dateFilterType]);

  useEffect(() => {
    const fetchPayments = async () => {
      console.log(
        "📊 [REPORTS DEBUG] Starting to fetch payments for orders:",
        allOrdersForDate.map((o) => ({ id: o.id, status: o.status })),
      );
      const payments: Record<
        string,
        Array<{ paymentMethod: string; amount: number }>
      > = {};
      // Fetch payments for ALL orders (not just completed ones)
      for (const order of allOrdersForDate) {
        console.log(
          `📊 [REPORTS DEBUG] Fetching payments for order ${order.id} (status: ${order.status})`,
        );
        const orderPayments = await getPaymentsForOrder(order.id);
        console.log(
          `📊 [REPORTS DEBUG] Payments for order ${order.id}:`,
          orderPayments,
        );
        payments[order.id] = orderPayments;
      }
      console.log("📊 [REPORTS DEBUG] All payments fetched:", payments);
      setPaymentsByOrder(payments);
    };

    if (allOrdersForDate.length > 0) {
      fetchPayments();
    } else {
      console.log(
        "📊 [REPORTS DEBUG] No orders found for date, skipping payments fetch",
      );
    }
  }, [allOrdersForDate, getPaymentsForOrder]);

  const handlePosReportDateChange = (date: Date) => {
    setPosReportDate(date);
  };

  const handlePrint = (
    data: PosReportData,
    date: Date,
    filterType: string,
    isDetailed: boolean,
  ) => {
    const html = generateReportHtml(data, date, filterType, isDetailed);
    setReportHtml(html);
    setPrintDialogOpen(true);
  };

  const posReportData = useMemo(() => {
    console.log("📊 [REPORTS DEBUG] Calculating report data...");
    console.log(
      "📊 [REPORTS DEBUG] Input data - filteredOrders:",
      filteredOrders,
    );
    console.log(
      "📊 [REPORTS DEBUG] Input data - paymentsByOrder:",
      paymentsByOrder,
    );
    console.log(
      "📊 [REPORTS DEBUG] Input data - allOrdersForDate:",
      allOrdersForDate,
    );

    // Sales calculations should only include completed orders
    const totalSales = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );
    const totalTax = filteredOrders.reduce(
      (sum, order) => sum + order.taxAmount,
      0,
    );
    const totalSubtotal = filteredOrders.reduce(
      (sum, order) => sum + order.subtotal,
      0,
    );

    console.log("📊 [REPORTS DEBUG] Sales calculations:", {
      totalSales,
      totalTax,
      totalSubtotal,
    });

    // Payment calculations should include ALL orders (completed or not)
    const salesByPaymentType = Object.values(paymentsByOrder)
      .flat()
      .reduce(
        (acc: Record<string, number>, payment) => {
          acc[payment.paymentMethod] =
            (acc[payment.paymentMethod] || 0) + payment.amount;
          return acc;
        },
        {} as Record<string, number>,
      );

    console.log(
      "📊 [REPORTS DEBUG] Sales by payment type:",
      salesByPaymentType,
    );

    // Order type calculations should only include completed orders
    const salesByOrderType = filteredOrders.reduce(
      (acc: Record<string, number>, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + order.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("📊 [REPORTS DEBUG] Sales by order type:", salesByOrderType);

    // Item calculations should only include completed orders
    const allItems = filteredOrders.flatMap((order) => order.items);
    const totalItemsSold = allItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const itemSales: Record<
      string,
      { name: string; quantity: number; total: number }
    > = allItems.reduce(
      (acc, item) => {
        if (!acc[item.id]) {
          acc[item.id] = { name: item.name, quantity: 0, total: 0 };
        }
        acc[item.id].quantity += item.quantity;
        acc[item.id].total += item.total;
        return acc;
      },
      {} as Record<string, { name: string; quantity: number; total: number }>,
    );

    // Set top selling items list here.
    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    console.log("📊 [REPORTS DEBUG] Item calculations:", {
      totalItemsSold,
      topSellingItems: topSellingItems.slice(0, 5),
    });

    // Orders by status should include ALL orders (not just completed ones)
    const ordersByStatus = allOrdersForDate.reduce(
      (acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("📊 [REPORTS DEBUG] Orders by status:", ordersByStatus);

    const result = {
      totalSales,
      totalTax,
      totalSubtotal,
      salesByPaymentType,
      salesByOrderType,
      totalItemsSold,
      topSellingItems,
      totalOrders: filteredOrders.length,
      averageOrderValue:
        filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0,
      ordersByStatus,
    };

    console.log("📊 [REPORTS DEBUG] Final report data:", result);

    return result;
  }, [filteredOrders, paymentsByOrder, allOrdersForDate]);

  if (invoicesLoading || quotesLoading || ordersLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <Card>
            <CardHeader>
              <CardTitle>POS Reports</CardTitle>
              <CardDescription>X and Z reports for POS sales.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="x-report">
                <TabsList>
                  <TabsTrigger value="short-summary">Short Summary</TabsTrigger>
                  <TabsTrigger value="detailed-report">
                    Detailed Report
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="short-summary">
                  <PosReportTab
                    title="Short Summary"
                    data={posReportData}
                    date={posReportDate}
                    onDateChange={handlePosReportDateChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
                    isDetailed={false}
                    onPrint={() =>
                      handlePrint(
                        posReportData,
                        posReportDate,
                        dateFilterType,
                        false,
                      )
                    }
                    reportHtml={reportHtml}
                    printDialogOpen={printDialogOpen}
                    setPrintDialogOpen={setPrintDialogOpen}
                  />
                </TabsContent>
                <TabsContent value="detailed-report">
                  <PosReportTab
                    title="Detailed Report"
                    data={posReportData}
                    date={posReportDate}
                    onDateChange={handlePosReportDateChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
                    isDetailed={true}
                    onPrint={() =>
                      handlePrint(
                        posReportData,
                        posReportDate,
                        dateFilterType,
                        true,
                      )
                    }
                    reportHtml={reportHtml}
                    printDialogOpen={printDialogOpen}
                    setPrintDialogOpen={setPrintDialogOpen}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices Report</CardTitle>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{format(invoice.createdAt, "PPP")}</TableCell>
                      <TableCell>{invoice.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <CardTitle>Quotes Report</CardTitle>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell>{quote.id}</TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{format(quote.createdAt, "PPP")}</TableCell>
                      <TableCell>{quote.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ReportsPageWithGuard() {
  return (
    <AdminManagerGuard>
      <ReportsPage />
    </AdminManagerGuard>
  );
}
