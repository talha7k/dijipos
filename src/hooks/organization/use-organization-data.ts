import { useEffect, useState, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

// Global singleton state for organization data
const globalOrganizationState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: Organization | null;
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `organization-${organizationId || 'none'}`;
}

export function useOrganizationData(organizationId: string | undefined) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    const existingListener = globalOrganizationState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setOrganization(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalOrganizationState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const organizationDoc = doc(db, 'organizations', organizationId);

    const unsubscribe = onSnapshot(
      organizationDoc,
      (docSnapshot) => {
        let orgData = null;
        if (docSnapshot.exists()) {
          orgData = {
            ...docSnapshot.data(),
            id: docSnapshot.id,
            createdAt: docSnapshot.data().createdAt?.toDate(),
            updatedAt: docSnapshot.data().updatedAt?.toDate(),
          } as Organization;
        }

        const listener = globalOrganizationState.listeners.get(cacheKey);
        if (listener) {
          listener.data = orgData;
          listener.loading = false;
          listener.error = null;
        }
        setOrganization(orgData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching organization:', error);
        const listener = globalOrganizationState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalOrganizationState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: null,
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalOrganizationState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalOrganizationState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  return { organization, loading, error };
}