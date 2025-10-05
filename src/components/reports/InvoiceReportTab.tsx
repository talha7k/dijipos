import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { formatDateTime } from "@/lib/utils";
import { ReportPrintDialog } from "@/components/ReportPrintDialog";
import { InvoiceReportDetails } from "./InvoiceReportDetails";
import { InvoiceReportData } from "@/types/reports";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { invoiceReportA4 } from "@/components/templates/reports/invoice-report-a4";
import { invoiceReportThermal } from "@/components/templates/reports/invoice-report-thermal";
import { shortInvoiceReportA4 } from "@/components/templates/reports/short-invoice-report-a4";
import { shortInvoiceReportThermal } from "@/components/templates/reports/short-invoice-report-thermal";

export function InvoiceReportTab({
  title,
  data,
  dateRange,
  onDateRangeChange,
  dateFilterType,
  onDateFilterTypeChange,
  isDetailed,
  onPrint,
  setPrintDialogOpen,
}: {
  title: string;
  data: InvoiceReportData;
  dateRange: { from: Date; to: Date };
  onDateRangeChange: (dateRange: { from: Date; to: Date }) => void;
  dateFilterType: string;
  onDateFilterTypeChange: (value: string) => void;
  isDetailed: boolean;
  onPrint: () => void;
  setPrintDialogOpen: (open: boolean) => void;
}) {
  const { formatCurrency } = useCurrency();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2">
           <DateRangePicker onDateRangeChange={onDateRangeChange}>
             <Button variant="outline">
               {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
             </Button>
           </DateRangePicker>
          <Select value={dateFilterType} onValueChange={onDateFilterTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Invoice Date</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
            </SelectContent>
          </Select>
            <ReportPrintDialog
              reportTemplates={[
                {
                  id: "invoice-report-a4",
                  name: isDetailed ? "Invoice Report A4" : "Short Summary A4",
                  content: isDetailed ? invoiceReportA4 : shortInvoiceReportA4,
                  type: "report",
                  defaultPaperSize: "210mm",
                  defaultMargins: { top: 10, right: 10, bottom: 10, left: 10 },
                  defaultPaddings: { top: 5, right: 5, bottom: 5, left: 5 },
                },
                {
                  id: "invoice-report-thermal",
                  name: isDetailed ? "Invoice Report Thermal" : "Short Summary Thermal",
                  content: isDetailed ? invoiceReportThermal : shortInvoiceReportThermal,
                  type: "report",
                  defaultPaperSize: "80mm",
                  defaultMargins: { top: 0, right: 0, bottom: 0, left: 0 },
                  defaultPaddings: { top: 3, right: 3, bottom: 3, left: 3 },
                },
              ]}
               data={{
                 ...data,
                 generationTime: formatDateTime(new Date()),
                 fromDate: formatDateTime(dateRange.from, false),
                 toDate: formatDateTime(dateRange.to, false),
                 title: `Invoice Report - ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`,
                 isDetailed,
                 totalInvoiceAmount: formatCurrency(data.totalInvoiceAmount),
                 totalPaidAmount: formatCurrency(data.totalPaidAmount),
                 totalUnpaidAmount: formatCurrency(data.totalUnpaidAmount),
                 totalOverdueAmount: formatCurrency(data.totalOverdueAmount),
                 totalTaxAmount: formatCurrency(data.totalTaxAmount),
                 totalSubtotal: formatCurrency(data.totalSubtotal),
                 averageInvoiceValue: formatCurrency(data.averageInvoiceValue),
                 invoicesByPaymentMethod: Object.fromEntries(
                   Object.entries(data.invoicesByPaymentMethod).map(([key, value]) => [key, formatCurrency(value)])
                 ),
                 agingReport: {
                   current: formatCurrency(data.agingReport.current),
                   days1_30: formatCurrency(data.agingReport.days1_30),
                   days31_60: formatCurrency(data.agingReport.days31_60),
                   days61_90: formatCurrency(data.agingReport.days61_90),
                   over90: formatCurrency(data.agingReport.over90),
                 },
               }}
             title={`Invoice Report - ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`}
             description="Configure and print your invoice report"
             onOpenChange={setPrintDialogOpen}
              allowedPageSizes={["210mm", "80mm", "letter"]}
           >
            <Button onClick={onPrint}>
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>
          </ReportPrintDialog>
        </div>
      </CardHeader>
       <CardContent>
          {isDetailed ? (
            <InvoiceReportDetails
              data={data}
              dateRange={dateRange}
              generationDate={new Date()}
            />
          ) : (
           <div className="space-y-6">
              <div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">
                    Generated: {new Date().toLocaleString()}
                  </Badge>
                  <Badge variant="outline">
                    From: {format(dateRange.from, "PPP")}
                  </Badge>
                  <Badge variant="outline">
                    To: {format(dateRange.to, "PPP")}
                  </Badge>
                </div>
              </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Summary</h3>
               <Table>
                 <TableBody>
                   <TableRow>
                     <TableCell>Total Invoices</TableCell>
                     <TableCell className="text-right">{data.totalInvoices}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Total Invoice Amount</TableCell>
                     <TableCell className="text-right">{formatCurrency(data.totalInvoiceAmount)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Paid Amount</TableCell>
                     <TableCell className="text-right text-green-600">{formatCurrency(data.totalPaidAmount)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Unpaid Amount</TableCell>
                     <TableCell className="text-right text-red-600">{formatCurrency(data.totalUnpaidAmount)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Overdue Amount</TableCell>
                     <TableCell className="text-right text-orange-600">{formatCurrency(data.totalOverdueAmount)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Subtotal</TableCell>
                     <TableCell className="text-right">{formatCurrency(data.totalSubtotal)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Total VAT</TableCell>
                     <TableCell className="text-right">{formatCurrency(data.totalTaxAmount)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell className="font-bold">Average Invoice Value</TableCell>
                     <TableCell className="text-right font-bold">{formatCurrency(data.averageInvoiceValue)}</TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
             </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Payment Status</h3>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Count</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                    <TableRow>
                      <TableCell className="text-green-600">Paid</TableCell>
                      <TableCell className="text-right">{data.paymentStatus.paid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-red-600">Unpaid</TableCell>
                      <TableCell className="text-right">{data.paymentStatus.unpaid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-yellow-600">Partially Paid</TableCell>
                      <TableCell className="text-right">{data.paymentStatus.partiallyPaid}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-orange-600">Overdue</TableCell>
                      <TableCell className="text-right">{data.paymentStatus.overdue}</TableCell>
                    </TableRow>
                 </TableBody>
               </Table>
             </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Payment Methods</h3>
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Method</TableHead>
                     <TableHead className="text-right">Amount</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                    {Object.entries(data.invoicesByPaymentMethod).map(([method, amount]) => (
                      <TableRow key={`payment-method-${method}`}>
                        <TableCell className="capitalize">{method}</TableCell>
                        <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
               </Table>
             </div>
           </div>
         )}
       </CardContent>
    </Card>
  );
}