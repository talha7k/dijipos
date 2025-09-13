import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function TablesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}