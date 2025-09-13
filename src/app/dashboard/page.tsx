'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quote, Invoice, Payment, Product, Service, Table } from '@/types';

function DashboardContent() {
  const { user, organizationId } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [analytics, setAnalytics] = useState({
    quotes: { count: 0, total: 0, pending: 0 },
    invoices: { count: 0, total: 0, unpaid: 0, paid: 0 },
    payments: { total: 0 },
    products: { count: 0 },
    services: { count: 0 },
    tables: { count: 0, available: 0 },
  });

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

  useEffect(() => {
    if (!organizationId) return;

    const unsubscribers = [
      // Quotes
      onSnapshot(query(collection(db, 'organizations', organizationId, 'quotes')), (snapshot) => {
        const quotes = snapshot.docs.map(doc => doc.data() as Quote);
        const total = quotes.reduce((sum, q) => sum + q.total, 0);
        const pending = quotes.filter(q => q.status === 'draft').length;
        setAnalytics(prev => ({ ...prev, quotes: { count: quotes.length, total, pending } }));
      }),

      // Invoices
      onSnapshot(query(collection(db, 'organizations', organizationId, 'invoices')), (snapshot) => {
        const invoices = snapshot.docs.map(doc => doc.data() as Invoice);
        const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
        const unpaid = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total, 0);
        const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
        setAnalytics(prev => ({ ...prev, invoices: { count: invoices.length, total, unpaid, paid } }));
      }),

      // Payments
      onSnapshot(query(collection(db, 'organizations', organizationId, 'payments')), (snapshot) => {
        const payments = snapshot.docs.map(doc => doc.data() as Payment);
        const total = payments.reduce((sum, p) => sum + p.amount, 0);
        setAnalytics(prev => ({ ...prev, payments: { total } }));
      }),

      // Products
      onSnapshot(query(collection(db, 'organizations', organizationId, 'products')), (snapshot) => {
        setAnalytics(prev => ({ ...prev, products: { count: snapshot.size } }));
      }),

      // Services
      onSnapshot(query(collection(db, 'organizations', organizationId, 'services')), (snapshot) => {
        setAnalytics(prev => ({ ...prev, services: { count: snapshot.size } }));
      }),

      // Tables
      onSnapshot(query(collection(db, 'organizations', organizationId, 'tables')), (snapshot) => {
        const tables = snapshot.docs.map(doc => doc.data() as Table);
        const available = tables.filter(table => table.status === 'available').length;
        setAnalytics(prev => ({ ...prev, tables: { count: tables.length, available } }));
      }),
    ];

    return () => unsubscribers.forEach(unsub => unsub());
  }, [organizationId]);

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
              <div className="text-2xl font-bold">${analytics.quotes.total.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                {analytics.quotes.count} total • {analytics.quotes.pending} pending
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
              <div className="text-2xl font-bold">${analytics.invoices.total.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                {analytics.invoices.count} total • ${analytics.invoices.unpaid.toFixed(2)} unpaid
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
              <div className="text-2xl font-bold">${analytics.payments.total.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">
                Revenue collected
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Products & Services</CardTitle>
              <CardDescription>Total Items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.products.count + analytics.services.count}</div>
              <p className="text-sm text-muted-foreground">
                {analytics.products.count} products • {analytics.services.count} services
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
              <div className="text-2xl font-bold">{analytics.tables.count}</div>
              <p className="text-sm text-muted-foreground">
                {analytics.tables.available} available • {analytics.tables.count - analytics.tables.available} occupied
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