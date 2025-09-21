'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, FileText, Receipt } from 'lucide-react';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useQuotes } from '@/lib/hooks/useQuotes';
import { useOrders } from '@/lib/hooks/useOrders';
import { AdminManagerGuard } from '@/components/layout/RoleGuard';
import { format } from 'date-fns';

function PosReportDetails({ data }) {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSales.toFixed(2)}</div>
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
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageOrderValue.toFixed(2)}</div>
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
                {Object.entries(data.salesByPaymentType).map(([type, amount]) => (
                  <TableRow key={type}>
                    <TableCell className="capitalize">{type}</TableCell>
                    <TableCell className="text-right">{amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
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
                    <TableCell className="text-right">{amount.toFixed(2)}</TableCell>
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
              {data.topSellingItems.map(item => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.total.toFixed(2)}</TableCell>
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
                <TableCell className="text-right">{data.totalSubtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total VAT Collected</TableCell>
                <TableCell className="text-right">{data.totalTax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Total Sales</TableCell>
                <TableCell className="text-right">{data.totalSales.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function generateReportHtml(data, reportDate, dateFilterType) {
  const title = `POS Sales Report - ${format(reportDate, 'PPP')} (${dateFilterType === 'selectedDate' ? 'Business Date' : 'Order Date'})`;
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

    <h2>Top Selling Items</h2>
    <table>
      <thead><tr><th>Item</th><th class="text-right">Quantity</th><th class="text-right">Total</th></tr></thead>
      <tbody>
        ${data.topSellingItems.map(item => `<tr><td>${item.name}</td><td class="text-right">${item.quantity}</td><td class="text-right">${item.total.toFixed(2)}</td></tr>`).join('')}
      </tbody>
    </table>

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

import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';

function PosReportTab({ title, data, date, onDateChange, dateFilterType, onDateFilterTypeChange }) {
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [reportHtml, setReportHtml] = useState("");

  const handlePrint = () => {
    const html = generateReportHtml(data, date, dateFilterType);
    setReportHtml(html);
    setPrintDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <DatePicker onDateChange={onDateChange} defaultDate={date}>
            <Button variant="outline">
              {format(date, 'PPP')}
            </Button>
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
          <Button onClick={handlePrint}><Download className="h-4 w-4 mr-2" />Print</Button>
        </div>
      </CardHeader>
      <CardContent>
        <PosReportDetails data={data} />
        <ReceiptPrintDialog
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          rawHtml={reportHtml}
          title={`POS Sales Report - ${format(date, 'PPP')}`}
        >
          {/* This dialog is opened programmatically, so it doesn't need a trigger child */}
          <div />
        </ReceiptPrintDialog>
      </CardContent>
    </Card>
  );
}

function ReportsPage() {
  const { salesInvoices, loading: invoicesLoading } = useInvoices();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { orders, loading: ordersLoading } = useOrders();

  const [posReportDate, setPosReportDate] = useState<Date>(new Date());
  const [dateFilterType, setDateFilterType] = useState('selectedDate');

  const handlePosReportDateChange = (date: Date) => {
    setPosReportDate(date);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date filter
      const dateToCompare = dateFilterType === 'selectedDate' ? (order.selectedDate ? new Date(order.selectedDate) : null) : order.createdAt;
      if (!dateToCompare || dateToCompare.toDateString() !== posReportDate.toDateString()) {
        return false;
      }

      // Payment status filter
      return order.paymentStatus === 'PAID' || order.paymentStatus === 'PARTIAL';
    });
  }, [orders, posReportDate, dateFilterType]);

  const posReportData = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalTax = filteredOrders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalSubtotal = filteredOrders.reduce((sum, order) => sum + order.subtotal, 0);

    const salesByPaymentType = filteredOrders.reduce((acc, order) => {
      order.payments?.forEach(p => {
        acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + p.amount;
      });
      return acc;
    }, {});

    const salesByOrderType = filteredOrders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + order.total;
      return acc;
    }, {});

    const allItems = filteredOrders.flatMap(order => order.items);
    const totalItemsSold = allItems.reduce((sum, item) => sum + item.quantity, 0);

    const itemSales = allItems.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = { name: item.name, quantity: 0, total: 0 };
      }
      acc[item.id].quantity += item.quantity;
      acc[item.id].total += item.total;
      return acc;
    }, {});

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return {
      totalSales,
      totalTax,
      totalSubtotal,
      salesByPaymentType,
      salesByOrderType,
      totalItemsSold,
      topSellingItems,
      totalOrders: filteredOrders.length,
      averageOrderValue: filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0,
    };
  }, [filteredOrders]);

  if (invoicesLoading || quotesLoading || ordersLoading) {
    return <div>Loading...</div>;
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
                  <TabsTrigger value="x-report">X Report</TabsTrigger>
                  <TabsTrigger value="z-report">Z Report</TabsTrigger>
                </TabsList>
                <TabsContent value="x-report">
                  <PosReportTab
                    title="X Report"
                    data={posReportData}
                    date={posReportDate}
                    onDateChange={handlePosReportDateChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
                  />
                </TabsContent>
                <TabsContent value="z-report">
                  <PosReportTab
                    title="Z Report"
                    data={posReportData}
                    date={posReportDate}
                    onDateChange={handlePosReportDateChange}
                    dateFilterType={dateFilterType}
                    onDateFilterTypeChange={setDateFilterType}
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
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
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
                  {salesInvoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{invoice.clientName}</TableCell>
                      <TableCell>{format(invoice.createdAt, 'PPP')}</TableCell>
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
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
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
                  {quotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell>{quote.id}</TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{format(quote.createdAt, 'PPP')}</TableCell>
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
