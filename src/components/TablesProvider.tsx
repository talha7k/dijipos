'use client';

import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table } from '@/types';
import {
  tablesAtom,
  tablesLoadingAtom,
  organizationIdAtom
} from '@/store/atoms';
import { ReactNode } from 'react';

interface TablesProviderProps {
  children: ReactNode;
}

export function TablesProvider({ children }: TablesProviderProps) {
  const [organizationId] = useAtom(organizationIdAtom);
  const setTables = useSetAtom(tablesAtom);
  const setTablesLoading = useSetAtom(tablesLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setTables([]);
      setTablesLoading(false);
      return;
    }

    console.log('TablesProvider: Setting up tables subscription for organization:', organizationId);
    setTablesLoading(true);

    // Set up single Firestore subscription for tables
    const tablesQuery = query(collection(db, 'organizations', organizationId, 'tables'));
    const unsubscribe = onSnapshot(tablesQuery, (querySnapshot) => {
      console.log('TablesProvider: Received tables snapshot with', querySnapshot.docs.length, 'documents');
      const tablesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Table[];
      setTables(tablesData);
      setTablesLoading(false);
    }, (error) => {
      console.error('TablesProvider: Error fetching tables:', error);
      setTables([]);
      setTablesLoading(false);
    });

    // Cleanup function
    return () => {
      console.log('TablesProvider: Cleaning up tables subscription');
      unsubscribe();
    };
  }, [organizationId, setTables, setTablesLoading]);

  return <>{children}</>;
}