import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { ReportPrintDialog } from "@/components/ReportPrintDialog";
import { PosReportDetails } from "./PosReportDetails";
import { PosReportData } from "@/types/reports";

export function PosReportTab({
  title,
  data,
  date,
  onDateChange,
  dateFilterType,
  onDateFilterTypeChange,
  isDetailed,
  onPrint,
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
          <ReportPrintDialog
            reportTemplates={[
              {
                id: "pos-report",
                name: "POS Report",
                content: "pos-report.html",
                type: "report",
              },
            ]}
            data={data}
            title={`POS Sales Report - ${format(date, "PPP")}`}
            onOpenChange={setPrintDialogOpen}
            allowedPageSizes={["210mm", "letter"]}
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
