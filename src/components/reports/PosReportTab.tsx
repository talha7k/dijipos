import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { formatDateTime } from "@/lib/utils";
import { ReportPrintDialog } from "@/components/ReportPrintDialog";
import { PosReportDetails } from "./PosReportDetails";
import { PosReportData } from "@/types/reports";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { posReportA4 } from "@/components/templates/reports/pos-report-a4";
import { posReportThermal } from "@/components/templates/reports/pos-report-thermal";
import { shortPosReportA4 } from "@/components/templates/reports/short-pos-report-a4";
import { shortPosReportThermal } from "@/components/templates/reports/short-pos-report-thermal";

export function PosReportTab({
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
  data: PosReportData;
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
              <SelectItem value="selectedDate">Business Date</SelectItem>
              <SelectItem value="createdAt">Order Date</SelectItem>
            </SelectContent>
          </Select>
            <ReportPrintDialog
              reportTemplates={[
                {
                  id: "pos-report-a4",
                  name: isDetailed ? "POS Report A4" : "Short Summary A4",
                  content: isDetailed ? posReportA4 : shortPosReportA4,
                  type: "report",
                  defaultPaperSize: "210mm",
                  defaultMargins: { top: 10, right: 10, bottom: 10, left: 10 },
                  defaultPaddings: { top: 5, right: 5, bottom: 5, left: 5 },
                },
                {
                  id: "pos-report-thermal",
                  name: isDetailed ? "POS Report Thermal" : "Short Summary Thermal",
                  content: isDetailed ? posReportThermal : shortPosReportThermal,
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
                 title: `POS Sales Report - ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`,
                 isDetailed,
                totalSales: formatCurrency(data.totalSales),
                totalSubtotal: formatCurrency(data.totalSubtotal),
                totalTax: formatCurrency(data.totalTax),
                salesByPaymentType: Object.fromEntries(
                  Object.entries(data.salesByPaymentType).map(([key, value]) => [key, formatCurrency(value)])
                ),
                salesByOrderType: Object.fromEntries(
                  Object.entries(data.salesByOrderType).map(([key, value]) => [key, formatCurrency(value)])
                ),
              }}
             title={`POS Sales Report - ${format(dateRange.from, "PPP")} to ${format(dateRange.to, "PPP")}`}
             description="Configure and print your POS sales report"
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
           <PosReportDetails data={data} />
         ) : (
           <div className="space-y-6">
              <div>
                <p>Report generated on: {new Date().toLocaleString()}</p>
                <p>From: {format(dateRange.from, "PPP")} To: {format(dateRange.to, "PPP")}</p>
              </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Summary</h3>
               <Table>
                 <TableBody>
                   <TableRow>
                     <TableCell>Total Orders Processed</TableCell>
                     <TableCell className="text-right">{data.totalOrders}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Total Items Sold</TableCell>
                     <TableCell className="text-right">{data.totalItemsSold}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Subtotal</TableCell>
                     <TableCell className="text-right">{formatCurrency(data.totalSubtotal)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell>Total VAT</TableCell>
                     <TableCell className="text-right">{formatCurrency(data.totalTax)}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell className="font-bold">Total Sales</TableCell>
                     <TableCell className="text-right font-bold">{formatCurrency(data.totalSales)}</TableCell>
                   </TableRow>
                 </TableBody>
               </Table>
             </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Total by Payment Type</h3>
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
                       <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>

             <div>
               <h3 className="text-lg font-semibold mb-2">Total by Order Type</h3>
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
