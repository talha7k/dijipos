import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { PosReportTab } from "./PosReportTab";
import { InvoiceReportTab } from "./InvoiceReportTab";
import { useMemo, useState, useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { OrderStatus } from "@/types";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { InvoiceStatus } from "@/types/enums";
import { InvoiceReportData } from "@/types/reports";

export function ReportsTabs() {
  const { salesInvoices } = useInvoices();
  const { orders, getPaymentsForOrder } = useOrders();
  const { storeSettings } = useStoreSettings();

  const [posReportDateRange, setPosReportDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  });
  const [dateFilterType, setDateFilterType] = useState("selectedDate");

  const [invoiceReportDateRange, setInvoiceReportDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: new Date()
  });
  const [invoiceDateFilterType, setInvoiceDateFilterType] = useState("createdAt");

  const [paymentsByOrder, setPaymentsByOrder] = useState<
    Record<string, Array<{ paymentMethod: string; amount: number }>>
  >({});

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const dateToCompare =
        dateFilterType === "selectedDate"
          ? order.selectedDate
            ? new Date(order.selectedDate)
            : null
          : order.createdAt;
      if (!dateToCompare) {
        return false;
      }
      const startOfDay = new Date(posReportDateRange.from);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(posReportDateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      return dateToCompare >= startOfDay && dateToCompare <= endOfDay && order.status === OrderStatus.COMPLETED;
    });
  }, [orders, posReportDateRange, dateFilterType]);

  const allOrdersForDate = useMemo(() => {
    return orders.filter((order) => {
      const dateToCompare =
        dateFilterType === "selectedDate"
          ? order.selectedDate
            ? new Date(order.selectedDate)
            : null
          : order.createdAt;
      if (!dateToCompare) {
        return false;
      }
      const startOfDay = new Date(posReportDateRange.from);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(posReportDateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      return dateToCompare >= startOfDay && dateToCompare <= endOfDay;
    });
  }, [orders, posReportDateRange, dateFilterType]);

  useEffect(() => {
    const fetchPayments = async () => {
      const payments: Record<
        string,
        Array<{ paymentMethod: string; amount: number }>
      > = {};
      for (const order of allOrdersForDate) {
        const orderPayments = await getPaymentsForOrder(order.id);
        payments[order.id] = orderPayments;
      }
      setPaymentsByOrder(payments);
    };

    if (allOrdersForDate.length > 0) {
      fetchPayments();
    }
  }, [allOrdersForDate, getPaymentsForOrder]);

  const handlePosReportDateRangeChange = (dateRange: { from: Date; to: Date }) => {
    setPosReportDateRange(dateRange);
  };

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [invoicePrintDialogOpen, setInvoicePrintDialogOpen] = useState(false);

  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter((invoice) => {
      const dateToCompare =
        invoiceDateFilterType === "createdAt"
          ? invoice.createdAt
          : invoice.dueDate;
      
      const startOfDay = new Date(invoiceReportDateRange.from);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(invoiceReportDateRange.to);
      endOfDay.setHours(23, 59, 59, 999);
      return dateToCompare >= startOfDay && dateToCompare <= endOfDay;
    });
  }, [salesInvoices, invoiceReportDateRange, invoiceDateFilterType]);

  const invoiceReportData = useMemo((): InvoiceReportData => {
    const totalInvoiceAmount = filteredInvoices.reduce(
      (sum, invoice) => sum + invoice.total,
      0,
    );
    const totalTaxAmount = filteredInvoices.reduce(
      (sum, invoice) => sum + invoice.taxAmount,
      0,
    );
    const totalSubtotal = filteredInvoices.reduce(
      (sum, invoice) => sum + invoice.subtotal,
      0,
    );

    const totalPaidAmount = filteredInvoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce(
        (paymentSum, payment) => paymentSum + payment.amount,
        0
      );
      return sum + paidAmount;
    }, 0);

    const totalUnpaidAmount = filteredInvoices.reduce((sum, invoice) => {
      const paidAmount = invoice.payments.reduce(
        (paymentSum, payment) => paymentSum + payment.amount,
        0
      );
      return sum + (invoice.total - paidAmount);
    }, 0);

    const now = new Date();
    const totalOverdueAmount = filteredInvoices.reduce((sum, invoice) => {
      if (invoice.dueDate < now && invoice.status !== InvoiceStatus.PAID) {
        const paidAmount = invoice.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.amount,
          0
        );
        return sum + (invoice.total - paidAmount);
      }
      return sum;
    }, 0);

    const invoicesByStatus = filteredInvoices.reduce(
      (acc: Record<string, number>, invoice) => {
        acc[invoice.status] = (acc[invoice.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const invoicesByPaymentMethod = filteredInvoices.flatMap(invoice => 
      invoice.payments.map(payment => payment.paymentMethod)
    ).reduce(
      (acc: Record<string, number>, method) => {
        const methodTotal = filteredInvoices
          .flatMap(invoice => invoice.payments)
          .filter(payment => payment.paymentMethod === method)
          .reduce((sum, payment) => sum + payment.amount, 0);
        acc[method] = methodTotal;
        return acc;
      },
      {} as Record<string, number>,
    );

    const allInvoiceItems = filteredInvoices.flatMap((invoice) => invoice.items);
    const itemSales: Record<string, { name: string; quantity: number; total: number }> = 
      allInvoiceItems.reduce(
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

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const customerSales: Record<string, { name: string; invoiceCount: number; totalAmount: number }> = 
      filteredInvoices.reduce(
        (acc, invoice) => {
          if (!acc[invoice.clientName]) {
            acc[invoice.clientName] = { name: invoice.clientName, invoiceCount: 0, totalAmount: 0 };
          }
          acc[invoice.clientName].invoiceCount += 1;
          acc[invoice.clientName].totalAmount += invoice.total;
          return acc;
        },
        {} as Record<string, { name: string; invoiceCount: number; totalAmount: number }>,
      );

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    const paymentStatus = {
      paid: invoicesByStatus[InvoiceStatus.PAID] || 0,
      unpaid: invoicesByStatus[InvoiceStatus.WAITING_PAYMENT] || 0,
      partiallyPaid: invoicesByStatus[InvoiceStatus.PARTIALLY_PAID] || 0,
      overdue: filteredInvoices.filter(invoice => 
        invoice.dueDate < now && invoice.status !== InvoiceStatus.PAID
      ).length,
    };

    const agingReport = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      over90: 0,
    };

    filteredInvoices.forEach(invoice => {
      if (invoice.status === InvoiceStatus.PAID) return;
      
      const paidAmount = invoice.payments.reduce(
        (paymentSum, payment) => paymentSum + payment.amount,
        0
      );
      const unpaidAmount = invoice.total - paidAmount;
      
      if (unpaidAmount <= 0) return;
      
      const daysOverdue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue <= 0) {
        agingReport.current += unpaidAmount;
      } else if (daysOverdue <= 30) {
        agingReport.days1_30 += unpaidAmount;
      } else if (daysOverdue <= 60) {
        agingReport.days31_60 += unpaidAmount;
      } else if (daysOverdue <= 90) {
        agingReport.days61_90 += unpaidAmount;
      } else {
        agingReport.over90 += unpaidAmount;
      }
    });

    return {
      totalInvoices: filteredInvoices.length,
      totalInvoiceAmount,
      totalPaidAmount,
      totalUnpaidAmount,
      totalOverdueAmount,
      totalTaxAmount,
      totalSubtotal,
      averageInvoiceValue: filteredInvoices.length > 0 ? totalInvoiceAmount / filteredInvoices.length : 0,
      invoicesByStatus,
      invoicesByPaymentMethod,
      topCustomers,
      topSellingItems,
      paymentStatus,
      agingReport,
    };
  }, [filteredInvoices]);

  const handleInvoiceReportDateRangeChange = (dateRange: { from: Date; to: Date }) => {
    setInvoiceReportDateRange(dateRange);
  };

  const posReportData = useMemo(() => {
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

    const totalCommission = filteredOrders.reduce((sum, order) => {
      const orderType = storeSettings?.orderTypes.find(
        (ot) => ot.name === order.orderType,
      );
      if (orderType && orderType.commission) {
        return sum + order.total * (orderType.commission / 100);
      }
      return sum;
    }, 0);

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

    const salesByOrderType = filteredOrders.reduce(
      (acc: Record<string, number>, order) => {
        acc[order.orderType] = (acc[order.orderType] || 0) + order.total;
        return acc;
      },
      {} as Record<string, number>,
    );

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

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const ordersByStatus = allOrdersForDate.reduce(
      (acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
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
      totalCommission,
    };
  }, [filteredOrders, paymentsByOrder, allOrdersForDate, storeSettings]);

  return (
    <Tabs defaultValue="pos">
      <TabsList>
        <TabsTrigger value="pos">POS</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>

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
                <TabsTrigger value="detailed-report">Detailed Report</TabsTrigger>
              </TabsList>
                <TabsContent value="short-summary">
                  <PosReportTab
                    title="Short Summary"
                    data={posReportData}
                    dateRange={posReportDateRange}
                    onDateRangeChange={handlePosReportDateRangeChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
                    isDetailed={false}
                    onPrint={() => setPrintDialogOpen(true)}
                    setPrintDialogOpen={setPrintDialogOpen}
                  />
                </TabsContent>
                <TabsContent value="detailed-report">
                  <PosReportTab
                    title="Detailed Report"
                    data={posReportData}
                    dateRange={posReportDateRange}
                    onDateRangeChange={handlePosReportDateRangeChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
                    isDetailed={true}
                    onPrint={() => setPrintDialogOpen(true)}
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
            <CardTitle>Invoice Reports</CardTitle>
            <CardDescription>Detailed invoice reports and analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="short-summary">
              <TabsList>
                <TabsTrigger value="short-summary">Short Summary</TabsTrigger>
                <TabsTrigger value="detailed-report">Detailed Report</TabsTrigger>
              </TabsList>
                <TabsContent value="short-summary">
                  <InvoiceReportTab
                    title="Short Summary"
                    data={invoiceReportData}
                    dateRange={invoiceReportDateRange}
                    onDateRangeChange={handleInvoiceReportDateRangeChange}
                    dateFilterType={invoiceDateFilterType}
                    onDateFilterTypeChange={setInvoiceDateFilterType}
                    isDetailed={false}
                    onPrint={() => setInvoicePrintDialogOpen(true)}
                    setPrintDialogOpen={setInvoicePrintDialogOpen}
                  />
                </TabsContent>
                <TabsContent value="detailed-report">
                  <InvoiceReportTab
                    title="Detailed Report"
                    data={invoiceReportData}
                    dateRange={invoiceReportDateRange}
                    onDateRangeChange={handleInvoiceReportDateRangeChange}
                    dateFilterType={invoiceDateFilterType}
                    onDateFilterTypeChange={setInvoiceDateFilterType}
                    isDetailed={true}
                    onPrint={() => setInvoicePrintDialogOpen(true)}
                    setPrintDialogOpen={setInvoicePrintDialogOpen}
                  />
                </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </TabsContent>


    </Tabs>
  );
}