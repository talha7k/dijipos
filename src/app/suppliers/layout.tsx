import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function SuppliersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}