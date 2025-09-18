'use client';

import { useEffect } from 'react';
import { enablePersistence } from '@/lib/firebase/config';

export default function FirestoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // This effect runs once on the client after the component mounts
    enablePersistence();
  }, []);

  return <>{children}</>;
}