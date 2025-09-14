'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';

interface OrderProviderWrapperProps {
  children: ReactNode;
}

export function OrderProviderWrapper({ children }: OrderProviderWrapperProps) {
  const { organizationId } = useAuth();
  return (
    <OrderProvider organizationId={organizationId || undefined}>
      {children}
    </OrderProvider>
  );
}