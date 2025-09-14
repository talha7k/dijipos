import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function CompanyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}