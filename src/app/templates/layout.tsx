import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function TemplatesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}