import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useQuotes } from "@/lib/hooks/useQuotes";
import { PosReportTab } from "./PosReportTab";
import { useMemo, useState, useEffect } from "react";
import { useOrders } from "@/lib/hooks/useOrders";
import { OrderStatus } from "@/types";

export function ReportsTabs() {
  const { salesInvoices } = useInvoices();
  const { quotes } = useQuotes();
  const { orders, getPaymentsForOrder } = useOrders();

  const [posReportDate, setPosReportDate] = useState<Date>(new Date());
  const [dateFilterType, setDateFilterType] = useState("selectedDate");

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
      if (
        !dateToCompare ||
        dateToCompare.toDateString() !== posReportDate.toDateString()
      ) {
        return false;
      }
      return order.status === OrderStatus.COMPLETED;
    });
  }, [orders, posReportDate, dateFilterType]);

  const allOrdersForDate = useMemo(() => {
    return orders.filter((order) => {
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
  }, [orders, posReportDate, dateFilterType]);

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

  const handlePosReportDateChange = (date: Date) => {
    setPosReportDate(date);
  };

  const [printDialogOpen, setPrintDialogOpen] = useState(false);

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
    };
  }, [filteredOrders, paymentsByOrder, allOrdersForDate]);

  return (
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
                <TabsTrigger value="detailed-report">Detailed Report</TabsTrigger>
              </TabsList>
              <TabsContent value="short-summary">
                <PosReportTab
                  title="Short Summary"
                  data={posReportData}
                  date={posReportDate}
                  onDateChange={handlePosReportDateChange}
                  dateFilterType={dateFilterType}
                  onDateFilterTypeChange={setDateFilterType}
                  isDetailed={true}
                  onPrint={() => setPrintDialogOpen(true)}
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
  );
}