import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InvoiceReportData } from "@/types/reports";
import { format } from "date-fns";

interface InvoiceReportDetailsProps {
  data: InvoiceReportData;
  dateRange: { from: Date; to: Date };
  generationDate: Date;
}

export function InvoiceReportDetails({ data, dateRange, generationDate }: InvoiceReportDetailsProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline">
          Generated: {generationDate.toLocaleString()}
        </Badge>
        <Badge variant="outline">
          From: {format(dateRange.from, "PPP")}
        </Badge>
        <Badge variant="outline">
          To: {format(dateRange.to, "PPP")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalInvoiceAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.totalPaidAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.totalUnpaidAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aging Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Current</TableCell>
                  <TableCell className="text-right">
                    {data.agingReport.current.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>1-30 Days</TableCell>
                  <TableCell className="text-right">
                    {data.agingReport.days1_30.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>31-60 Days</TableCell>
                  <TableCell className="text-right">
                    {data.agingReport.days31_60.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>61-90 Days</TableCell>
                  <TableCell className="text-right">
                    {data.agingReport.days61_90.toFixed(2)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Over 90 Days</TableCell>
                  <TableCell className="text-right">
                    {data.agingReport.over90.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Invoices</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topCustomers.map((customer) => (
                <TableRow key={`customer-${customer.name}`}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell className="text-right">{customer.invoiceCount}</TableCell>
                  <TableCell className="text-right">
                    {customer.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
                <TableRow key={`invoice-item-${item.name}`}>
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
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="text-right">
                    {amount.toFixed(2)}
                  </TableCell>
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
                <TableCell>Total VAT</TableCell>
                <TableCell className="text-right">
                  {data.totalTaxAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Invoice Amount</TableCell>
                <TableCell className="text-right">
                  {data.totalInvoiceAmount.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Average Invoice Value</TableCell>
                <TableCell className="text-right">
                  {data.averageInvoiceValue.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}