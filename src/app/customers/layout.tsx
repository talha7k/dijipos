import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function CustomersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}