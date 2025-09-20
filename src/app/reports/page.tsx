'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, FileText, Receipt } from 'lucide-react';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { useQuotes } from '@/lib/hooks/useQuotes';
import { useOrders } from '@/lib/hooks/useOrders';
import { AdminManagerGuard } from '@/components/layout/RoleGuard';
import { format } from 'date-fns';

function ReportsPage() {
  const { salesInvoices, loading: invoicesLoading } = useInvoices();
  const { quotes, loading: quotesLoading } = useQuotes();
  const { orders, loading: ordersLoading } = useOrders();

  const [posReportDate, setPosReportDate] = useState<Date>(new Date());

  const handlePosReportDateChange = (date: Date) => {
    setPosReportDate(date);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (!order.selectedDate) return false;
      const orderDate = new Date(order.selectedDate);
      return orderDate.toDateString() === posReportDate.toDateString();
    });
  }, [orders, posReportDate]);

  const posReportData = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalTax = filteredOrders.reduce((sum, order) => sum + order.taxAmount, 0);
    return { totalSales, totalTax };
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
                  <Card>
                    <CardHeader>
                      <CardTitle>X Report</CardTitle>
                      <div className="flex items-center space-x-2">
                        <DatePicker onDateChange={handlePosReportDateChange}>
                          <Button variant="outline">
                            {format(posReportDate, 'PPP')}
                          </Button>
                        </DatePicker>
                        <Button size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Sales</TableCell>
                            <TableCell>{posReportData.totalSales.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Tax</TableCell>
                            <TableCell>{posReportData.totalTax.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="z-report">
                  <Card>
                    <CardHeader>
                      <CardTitle>Z Report</CardTitle>
                      <div className="flex items-center space-x-2">
                        <DatePicker onDateChange={handlePosReportDateChange}>
                          <Button variant="outline">
                            {format(posReportDate, 'PPP')}
                          </Button>
                        </DatePicker>
                        <Button size="sm"><Download className="h-4 w-4 mr-2" />Export</Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Total Sales</TableCell>
                            <TableCell>{posReportData.totalSales.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Total Tax</TableCell>
                            <TableCell>{posReportData.totalTax.toFixed(2)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
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
