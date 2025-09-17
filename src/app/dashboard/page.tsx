'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOrganization } from '@/lib/hooks/useOrganization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import { useQuotes } from '@/lib/hooks/useQuotes';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { usePayments } from '@/lib/hooks/usePayments';
import { useProducts } from '@/lib/hooks/useProducts';
import { useServices } from '@/lib/hooks/useServices';
import { useTables } from '@/lib/hooks/useTables';
import { TableStatus } from '@/types';

function DashboardContent() {
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { quotes } = useQuotes();
  const { salesInvoices: invoices } = useInvoices();
  const { payments } = usePayments();
  const { products } = useProducts();
  const { services } = useServices();
  const { tables } = useTables();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" loading={isLoggingOut}>Logout</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/quotes">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>Total Value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${quotes.reduce((sum, q) => sum + q.total, 0).toFixed(2)}</div>
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
              <div className="text-2xl font-bold">${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                {invoices.length} total • ${invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} unpaid
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
               <div className="text-2xl font-bold">${payments.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}</div>
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