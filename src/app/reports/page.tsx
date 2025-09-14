'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, TrendingUp, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvoiceType } from '@/types';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  type: InvoiceType;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: string;
  createdAt: Timestamp;
  dueDate: Timestamp;
}

interface ReportData {
  totalSales: number;
  totalPurchases: number;
  totalVATCollected: number;
  totalVATPaid: number;
  netVATPayable: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
}

export default function ReportsPage() {
  const { organizationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [reportType, setReportType] = useState('monthly');
  const [exporting, setExporting] = useState(false);
  const [exportingVAT, setExportingVAT] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      const invoicesRef = collection(db, 'organizations', organizationId, 'invoices');
      const q = query(invoicesRef);
      const querySnapshot = await getDocs(q);
      
      const invoicesData: Invoice[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        invoicesData.push({
          id: doc.id,
          type: data.type,
          items: data.items || [],
          subtotal: data.subtotal || 0,
          taxRate: data.taxRate || 0,
          taxAmount: data.taxAmount || 0,
          total: data.total || 0,
          status: data.status,
          createdAt: data.createdAt,
          dueDate: data.dueDate
        });
      });
      
      setInvoices(invoicesData);
      
      // Set default date range to current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setDateRange({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const calculateReportData = useCallback(() => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    endDate.setHours(23, 59, 59, 999); // Include end date
    
    // Filter invoices by date range
    const filteredInvoices = invoices.filter(invoice => {
      const invoiceDate = invoice.createdAt.toDate();
      return invoiceDate >= startDate && invoiceDate <= endDate;
    });
    
    // Calculate totals
    const salesInvoices = filteredInvoices.filter(inv => inv.type === InvoiceType.SALES);
  const purchaseInvoices = filteredInvoices.filter(inv => inv.type === InvoiceType.PURCHASE);
    
    const totalSales = salesInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPurchases = purchaseInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    const totalVATCollected = salesInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const totalVATPaid = purchaseInvoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    
    const netVATPayable = totalVATCollected - totalVATPaid;
    
    // Calculate profit
    const salesSubtotal = salesInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const purchaseSubtotal = purchaseInvoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    
    const grossProfit = salesSubtotal - purchaseSubtotal;
    const netProfit = totalSales - totalPurchases;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
    
    setReportData({
      totalSales: totalSales || 0,
      totalPurchases: totalPurchases || 0,
      totalVATCollected: totalVATCollected || 0,
      totalVATPaid: totalVATPaid || 0,
      netVATPayable: netVATPayable || 0,
      grossProfit: grossProfit || 0,
      netProfit: netProfit || 0,
      profitMargin: profitMargin || 0
    });
  }, [invoices, dateRange]);

  useEffect(() => {
    if (organizationId) {
      fetchInvoices();
    }
  }, [organizationId, fetchInvoices]);

  useEffect(() => {
    if (invoices.length > 0) {
      calculateReportData();
    }
  }, [invoices, dateRange, reportType, calculateReportData]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportReport = async () => {
    if (!reportData) return;
    
    setExporting(true);
    try {
      // Create CSV content
      const csvContent = [
        ['Report Type', reportType],
        ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
        [''],
        ['Financial Metrics', 'Amount'],
        ['Total Sales', reportData.totalSales.toFixed(2)],
        ['Total Purchases', reportData.totalPurchases.toFixed(2)],
        ['Gross Profit', reportData.grossProfit.toFixed(2)],
        ['Net Profit', reportData.netProfit.toFixed(2)],
        ['Profit Margin', `${reportData.profitMargin.toFixed(2)}%`],
        [''],
        ['VAT Information', 'Amount'],
        ['VAT Collected', reportData.totalVATCollected.toFixed(2)],
        ['VAT Paid', reportData.totalVATPaid.toFixed(2)],
        ['Net VAT Payable', reportData.netVATPayable.toFixed(2)]
      ].map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExporting(false);
    }
  };

  const handleExportVATReport = async () => {
    if (!reportData) return;
    
    setExportingVAT(true);
    try {
      // Create CSV content for VAT report
      const csvContent = [
        ['VAT Report', ''],
        ['Report Type', reportType],
        ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
        [''],
        ['VAT Details', 'Amount'],
        ['VAT Collected on Sales', reportData.totalVATCollected.toFixed(2)],
        ['VAT Paid on Purchases', reportData.totalVATPaid.toFixed(2)],
        ['Net VAT Payable', reportData.netVATPayable.toFixed(2)],
        [''],
        ['Supporting Documents', ''],
        ['Total Sales Invoices', invoices.filter(inv => inv.type === InvoiceType.SALES).length],
        ['Total Purchase Invoices', invoices.filter(inv => inv.type === InvoiceType.PURCHASE).length]
      ].map(row => row.join(',')).join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vat-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setExportingVAT(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">
            View and export profit & loss statements and VAT reports
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Select date range and report type to generate financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profit-loss" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profit-loss" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Profit & Loss
          </TabsTrigger>
          <TabsTrigger value="vat" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            VAT Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>
                  Financial performance for the selected period
                </CardDescription>
              </div>
              <Button onClick={handleExportReport} loading={exporting} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">SAR {reportData.totalSales.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">SAR {reportData.totalPurchases.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          SAR {reportData.netProfit.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${reportData.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {reportData.profitMargin.toFixed(2)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Profit & Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount (SAR)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Total Sales Revenue</TableCell>
                            <TableCell className="text-right">{reportData.totalSales.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Cost of Sales</TableCell>
                            <TableCell className="text-right">{reportData.totalPurchases.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">Gross Profit</TableCell>
                            <TableCell className="text-right font-bold">{reportData.grossProfit.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">VAT Collected</TableCell>
                            <TableCell className="text-right">{reportData.totalVATCollected.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">VAT Paid</TableCell>
                            <TableCell className="text-right">{reportData.totalVATPaid.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">Net Profit</TableCell>
                            <TableCell className={`text-right font-bold ${reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {reportData.netProfit.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>VAT Report</CardTitle>
                <CardDescription>
                  VAT calculation and details for tax filing purposes
                </CardDescription>
              </div>
              <Button onClick={handleExportVATReport} loading={exportingVAT} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export VAT Report
              </Button>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">VAT Collected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">SAR {reportData.totalVATCollected.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">VAT Paid</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">SAR {reportData.totalVATPaid.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Net VAT Payable</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${reportData.netVATPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          SAR {reportData.netVATPayable.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>VAT Calculation Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount (SAR)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Total Sales (excluding VAT)</TableCell>
                            <TableCell className="text-right">{(reportData.totalSales - reportData.totalVATCollected).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">VAT Collected on Sales</TableCell>
                            <TableCell className="text-right">{reportData.totalVATCollected.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Purchases (excluding VAT)</TableCell>
                            <TableCell className="text-right">{(reportData.totalPurchases - reportData.totalVATPaid).toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">VAT Paid on Purchases</TableCell>
                            <TableCell className="text-right">{reportData.totalVATPaid.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-bold">Net VAT Payable</TableCell>
                            <TableCell className={`text-right font-bold ${reportData.netVATPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {reportData.netVATPayable.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>VAT Submission Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Reporting Period</p>
                          <p className="font-medium">{dateRange.startDate} to {dateRange.endDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Filing Deadline</p>
                          <p className="font-medium">
                            {reportType === 'monthly' 
                              ? 'Last day of following month' 
                              : reportType === 'quarterly' 
                                ? 'Last day of month following quarter end' 
                                : 'Last day of month following year end'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm">
                          This report is generated for tax filing purposes. Please ensure all invoices are accurate and up-to-date before submission.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data available for the selected period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}