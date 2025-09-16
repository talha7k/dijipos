import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

// Global singleton state for users data
const globalUsersState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: User[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `users-${organizationId || 'none'}`;
}

export function useUsersData(organizationId: string | undefined) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const existingListener = globalUsersState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setUsers(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalUsersState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    // Fetch users with real-time updates
    const usersQ = query(collection(db, 'organizations', organizationId, 'users'));
    const unsubscribe = onSnapshot(usersQ, (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as User[];

      const listener = globalUsersState.listeners.get(cacheKey);
      if (listener) {
        listener.data = usersData;
        listener.loading = false;
        listener.error = null;
      }
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      const listener = globalUsersState.listeners.get(cacheKey);
      if (listener) {
        listener.loading = false;
        listener.error = error.message;
      }
      setError(error.message);
      setLoading(false);
    });

    // Store the listener
    globalUsersState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    // Return cleanup function
    return () => {
      const listener = globalUsersState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalUsersState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  return {
    users,
    loading,
  };
}