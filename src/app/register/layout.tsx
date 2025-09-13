import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}