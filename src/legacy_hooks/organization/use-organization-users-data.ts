import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationUser } from '@/types';

// Global singleton state for organization users
const globalOrganizationUsersState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: OrganizationUser[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `organization-users-${organizationId || 'none'}`;
}

export function useOrganizationUsersData(organizationId: string | undefined) {
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setOrganizationUsers([]);
      setLoading(false);
      return;
    }

    const existingListener = globalOrganizationUsersState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setOrganizationUsers(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalOrganizationUsersState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const organizationUsersQuery = query(
      collection(db, 'organizationUsers'),
      where('organizationId', '==', organizationId)
    );

    const unsubscribe = onSnapshot(
      organizationUsersQuery,
      (querySnapshot) => {
        const users = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as OrganizationUser[];

        const listener = globalOrganizationUsersState.listeners.get(cacheKey);
        if (listener) {
          listener.data = users;
          listener.loading = false;
          listener.error = null;
        }
        setOrganizationUsers(users);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching organization users:', error);
        const listener = globalOrganizationUsersState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalOrganizationUsersState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalOrganizationUsersState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalOrganizationUsersState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  return { organizationUsers, loading, error };
}