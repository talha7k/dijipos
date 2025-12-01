"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { UserRole } from "@/types/enums";
import { Loader } from "@/components/ui/loader";
import { toReadableTitle } from "@/lib/utils/title-case";
import {
  ShoppingCart,
  CheckCircle,
  Users,

  Package,
  Settings,
  TrendingUp,
  Building,
  User,
  CreditCard,
  Percent,
  Star,
  Clock,
  FileText,
  Home,
  FileDown,
  FileUp,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  console.log("[Dashboard] DashboardContent rendering...");
  const { data, loading, dateFilter, setDateFilter } = useDashboard();
  console.log("[Dashboard] useDashboard result:", { loading, dataKeys: Object.keys(data) });
  const {
    openOrdersCount,
    completedOrdersCount,

    totalOrdersYesterday,
    totalCustomers,
    totalTables,
    totalProducts,
    totalServices,
    totalSalesToday,
    totalSalesYesterday,
    topSellingItemsToday,
    topSellingItemsYesterday,
    salesByOrderTypeToday,
    salesByOrderTypeYesterday,
    userName,
    userRole,
    companyName,
    companyAddress,
    companyVatNumber,
    vatRate,
    salesInvoicesByStatus,
    purchaseInvoicesByStatus,
  } = data;

  const isManagerOrAdmin =
    userRole === UserRole.MANAGER || userRole === UserRole.OWNER;
  const currentTopSellingItems =
    dateFilter === "today" ? topSellingItemsToday : topSellingItemsYesterday;
  const currentSalesByOrderType =
    dateFilter === "today" ? salesByOrderTypeToday : salesByOrderTypeYesterday;

  if (loading) {
    console.log("[Dashboard] Still loading, showing loader...");
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader size="lg" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Company and User Info */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Home className="h-8 w-8" />
          Dashboard
        </h1>

        {/* Info Badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* User Info Section */}
          <div className="flex flex-wrap gap-3">
            {/* User Name Badge */}
            <Badge
              variant="secondary"
              className="flex items-center gap-2 px-3 py-1.5"
            >
              <User className="h-4 w-4" />
              <span className="font-medium">{userName}</span>
            </Badge>

            {/* User Role Badge */}
            {userRole && (
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <Star className="h-4 w-4" />
                <span className="font-medium">{toReadableTitle(userRole)}</span>
              </Badge>
            )}
          </div>

          {/* Vertical Separator */}
          {(companyName || companyVatNumber || companyAddress) && (
            <div className="h-6 w-px bg-border mx-2"></div>
          )}

          {/* Company Info Section */}
          <div className="flex flex-wrap gap-3">
            {/* Company Name Badge */}
            {companyName && (
              <Badge
                variant="default"
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <Building className="h-4 w-4" />
                <span className="font-medium">{companyName}</span>
              </Badge>
            )}

            {/* Company Address Badge */}
            {companyAddress && (
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <Building className="h-4 w-4" />
                <span className="font-medium">{companyAddress}</span>
              </Badge>
            )}

            {/* Company VAT Badge */}
            {companyVatNumber && (
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-3 py-1.5"
              >
                <Percent className="h-4 w-4" />
                <span className="font-medium">VAT: {companyVatNumber}</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Orders */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Active orders</p>
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Finished orders</p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>

        {/* Today's Sales (Manager/Admin Only) */}
        {isManagerOrAdmin && (
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {totalSalesToday.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalOrdersYesterday > 0 && (
                  <span
                    className={
                      totalSalesToday >= totalSalesYesterday
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {totalSalesYesterday > 0
                      ? `${(((totalSalesToday - totalSalesYesterday) / totalSalesYesterday) * 100).toFixed(1)}% from yesterday`
                      : "First day sales"}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      

      {/* Quick Actions - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
             <Link href="/pos">
               <Button className="w-full justify-start whitespace-normal" variant="outline">
                 <ShoppingCart className="h-4 w-4 mr-2" />
                 POS
               </Button>
             </Link>
             <Link href="/customers">
               <Button className="w-full justify-start whitespace-normal" variant="outline">
                 <Users className="h-4 w-4 mr-2" />
                 Customers
               </Button>
             </Link>
             <Link href="/products-services">
               <Button className="w-full justify-start whitespace-normal" variant="outline">
                 <Package className="h-4 w-4 mr-2" />
                 Products
               </Button>
             </Link>
             {isManagerOrAdmin && (
               <>
                 <Link href="/invoices">
                   <Button className="w-full justify-start whitespace-normal" variant="outline">
                     <CreditCard className="h-4 w-4 mr-2" />
                     Invoices
                   </Button>
                 </Link>

                 <Link href="/reports">
                   <Button className="w-full justify-start whitespace-normal" variant="outline">
                     <TrendingUp className="h-4 w-4 mr-2" />
                     Reports
                   </Button>
                 </Link>
               </>
             )}
           </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>POS Top Sellers</CardTitle>
              <Tabs
                value={dateFilter}
                onValueChange={(value) =>
                  setDateFilter(value as "today" | "yesterday")
                }
              >
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>Best performing items by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {currentTopSellingItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTopSellingItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-orange-600"
                                    : "bg-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        SAR {item.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sales data for {dateFilter}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Type Breakdown (Manager/Admin Only) */}
        {isManagerOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>POS Sales</CardTitle>
              <CardDescription>
                Revenue breakdown by order type for {dateFilter}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(currentSalesByOrderType).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(currentSalesByOrderType)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, amount]) => {
                        const total = Object.values(
                          currentSalesByOrderType,
                        ).reduce((sum, val) => sum + val, 0);
                        const percentage =
                          total > 0 ? (amount / total) * 100 : 0;
                        return (
                          <TableRow key={`dashboard-order-type-${type}`}>
                            <TableCell className="capitalize">
                              {type.replace("_", " ")}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              SAR {amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              {percentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No order type data for {dateFilter}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invoice Summary Section (Manager/Admin Only) */}
        {isManagerOrAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Invoices by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  Sales Invoices
                </CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(salesInvoicesByStatus).map(
                    ([status, count]) => {
                      const statusConfig = {
                        draft: {
                          icon: FileText,
                          color: "text-muted-foreground",
                          bgColor: "bg-muted",
                          borderColor: "border-border",
                          label: "Draft",
                        },
                        sent: {
                          icon: FileDown,
                          color: "text-blue-600 dark:text-blue-400",
                          bgColor: "bg-blue-50 dark:bg-blue-950",
                          borderColor: "border-blue-200 dark:border-blue-800",
                          label: "Sent",
                        },
                        paid: {
                          icon: CheckCircle2,
                          color: "text-green-600 dark:text-green-400",
                          bgColor: "bg-green-50 dark:bg-green-950",
                          borderColor: "border-green-200 dark:border-green-800",
                          label: "Paid",
                        },
                        overdue: {
                          icon: AlertCircle,
                          color: "text-destructive",
                          bgColor: "bg-red-50 dark:bg-red-950",
                          borderColor: "border-red-200 dark:border-red-800",
                          label: "Overdue",
                        },
                        cancelled: {
                          icon: XCircle,
                          color: "text-orange-600 dark:text-orange-400",
                          bgColor: "bg-orange-50 dark:bg-orange-950",
                          borderColor: "border-orange-200 dark:border-orange-800",
                          label: "Cancelled",
                        },
                      };
                      const config = statusConfig[
                        status as keyof typeof statusConfig
                      ] || {
                        icon: FileText,
                        color: "text-muted-foreground",
                        bgColor: "bg-muted",
                        borderColor: "border-border",
                        label: status,
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={status}
                          className={`flex items-center justify-between p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                              <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                            <div>
                              <span className="font-medium text-sm">{config.label}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {count === 1 ? '1 invoice' : `${count} invoices`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="font-semibold">
                              {count}
                            </Badge>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Purchase Invoices by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Purchase Invoices
                </CardTitle>
                <CardDescription>Breakdown by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(purchaseInvoicesByStatus).map(
                    ([status, count]) => {
                      const statusConfig = {
                        draft: {
                          icon: FileText,
                          color: "text-muted-foreground",
                          bgColor: "bg-muted",
                          borderColor: "border-border",
                          label: "Draft",
                        },
                        sent: {
                          icon: FileUp,
                          color: "text-blue-600 dark:text-blue-400",
                          bgColor: "bg-blue-50 dark:bg-blue-950",
                          borderColor: "border-blue-200 dark:border-blue-800",
                          label: "Sent",
                        },
                        received: {
                          icon: Timer,
                          color: "text-yellow-600 dark:text-yellow-400",
                          bgColor: "bg-yellow-50 dark:bg-yellow-950",
                          borderColor: "border-yellow-200 dark:border-yellow-800",
                          label: "Received",
                        },
                        partially_paid: {
                          icon: CircleDollarSign,
                          color: "text-orange-600 dark:text-orange-400",
                          bgColor: "bg-orange-50 dark:bg-orange-950",
                          borderColor: "border-orange-200 dark:border-orange-800",
                          label: "Partially Paid",
                        },
                        paid: {
                          icon: CheckCircle2,
                          color: "text-green-600 dark:text-green-400",
                          bgColor: "bg-green-50 dark:bg-green-950",
                          borderColor: "border-green-200 dark:border-green-800",
                          label: "Paid",
                        },
                        cancelled: {
                          icon: XCircle,
                          color: "text-destructive",
                          bgColor: "bg-red-50 dark:bg-red-950",
                          borderColor: "border-red-200 dark:border-red-800",
                          label: "Cancelled",
                        },
                      };
                      const config = statusConfig[
                        status as keyof typeof statusConfig
                      ] || {
                        icon: FileText,
                        color: "text-muted-foreground",
                        bgColor: "bg-muted",
                        borderColor: "border-border",
                        label: status,
                      };
                      const Icon = config.icon;

                      return (
                        <div
                          key={status}
                          className={`flex items-center justify-between p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-sm transition-shadow`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                              <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                            <div>
                              <span className="font-medium text-sm">{config.label}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {count === 1 ? '1 invoice' : `${count} invoices`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="font-semibold">
                              {count}
                            </Badge>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Store Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>
              Quick overview of store configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">VAT Rate</span>
              <Badge variant={vatRate ? "default" : "destructive"}>
                {vatRate ? `${vatRate}%` : "Not Set"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Products</span>
              <Badge variant="outline">{totalProducts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Services</span>
              <Badge variant="outline">{totalServices}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tables</span>
              <Badge variant="outline">{totalTables}</Badge>
            </div>
            <Link href="/settings">
              <Button className="w-full mt-4" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
