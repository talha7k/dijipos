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
  LayoutGrid,
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
} from "lucide-react";
import Link from "next/link";

function DashboardContent() {
  const { data, loading, dateFilter, setDateFilter } = useDashboard();
  const {
    openOrdersCount,
    completedOrdersCount,

    totalOrdersYesterday,
    totalCustomers,
    totalTables,
    availableTables,
    occupiedTables,
    totalProducts,
    totalServices,
    totalSalesToday,
    totalSalesYesterday,
    vatAmountToday,
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
  } = data;

  const isManagerOrAdmin =
    userRole === UserRole.MANAGER || userRole === UserRole.ADMIN;
  const currentTopSellingItems =
    dateFilter === "today" ? topSellingItemsToday : topSellingItemsYesterday;
  const currentSalesByOrderType =
    dateFilter === "today" ? salesByOrderTypeToday : salesByOrderTypeYesterday;

  if (loading) {
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
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
              <User className="h-4 w-4" />
              <span className="font-medium">{userName}</span>
            </Badge>
            
            {/* User Role Badge */}
            {userRole && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
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
              <Badge variant="default" className="flex items-center gap-2 px-3 py-1.5">
                <Building className="h-4 w-4" />
                <span className="font-medium">{companyName}</span>
              </Badge>
            )}
            
            {/* Company Address Badge */}
            {companyAddress && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <Building className="h-4 w-4" />
                <span className="font-medium">{companyAddress}</span>
              </Badge>
            )}
            
            {/* Company VAT Badge */}
            {companyVatNumber && (
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
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

        {/* Tables Status */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tables</CardTitle>
            <LayoutGrid className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTables}</div>
            <p className="text-xs text-muted-foreground">
              {availableTables} available • {occupiedTables} occupied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Cards (Manager/Admin Only) */}
      {isManagerOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
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

          {/* VAT Amount */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                VAT Collected
              </CardTitle>
              <Percent className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                SAR {vatAmountToday.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {vatRate ? `@ ${vatRate}%` : "VAT rate not set"}
              </p>
            </CardContent>
          </Card>

          {/* Products & Services */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">Total products</p>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Star className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalServices}</div>
              <p className="text-xs text-muted-foreground">Total services</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Selling Items</CardTitle>
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
              <CardTitle>Sales by Order Type</CardTitle>
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
                          <TableRow key={type}>
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and navigation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 grid-cols-2 grid space-x-2">
            <Link href="/pos">
              <Button className="w-full justify-start" variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Point of Sale
              </Button>
            </Link>
            <Link href="/customers">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Customer Management
              </Button>
            </Link>
            <Link href="/products-services">
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Products & Services
              </Button>
            </Link>
            {isManagerOrAdmin && (
              <>
                <Link href="/invoices">
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Invoices
                  </Button>
                </Link>
                <Link href="/quotes">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Quotes
                  </Button>
                </Link>
                <Link href="/reports">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

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
