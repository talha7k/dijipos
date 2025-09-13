import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function PurchaseProductsServicesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}