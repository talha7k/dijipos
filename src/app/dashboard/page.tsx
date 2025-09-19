'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useQuotes } from '@/lib/hooks/useQuotes';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { usePayments } from '@/lib/hooks/usePayments';
import { useProducts } from '@/lib/hooks/useProducts';
import { useServices } from '@/lib/hooks/useServices';
import { useTables } from '@/lib/hooks/useTables';
import { useCurrency } from '@/lib/hooks/useCurrency';
import { TableStatus, Payment } from '@/types';

function DashboardContent() {
  const { quotes } = useQuotes();
  const { salesInvoices: invoices } = useInvoices();
  const { payments } = usePayments();
  const { products } = useProducts();
  const { services } = useServices();
  const { tables } = useTables();
  const { formatCurrency } = useCurrency();

  

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/quotes">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(quotes.reduce((sum, q) => sum + q.total, 0))}</div>
              <p className="text-sm text-muted-foreground">
                {quotes.length} total • {quotes.filter(q => q.status === 'draft').length} pending
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(invoices.reduce((sum, inv) => sum + inv.total, 0))}</div>
              <p className="text-sm text-muted-foreground">
                {invoices.length} total • {formatCurrency(invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0))} unpaid
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payments">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>Total Received</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(payments.reduce((sum: number, p: Payment) => sum + p.amount, 0))}</div>
              <p className="text-sm text-muted-foreground">
                Revenue collected
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products-services">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>Total Items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length + services.length}</div>
              <p className="text-sm text-muted-foreground">
                {products.length} products • {services.length} services
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tables">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Tables</CardTitle>
              <CardDescription>Table Management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tables.length}</div>
              <p className="text-sm text-muted-foreground">
                        {tables.filter(table => table.status === TableStatus.AVAILABLE).length} available • {tables.filter(table => table.status !== TableStatus.AVAILABLE).length} occupied
                      </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-6">
        <Link href="/settings">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow max-w-xs">
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>Configure order types, payment methods, and VAT</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage your store configuration
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}