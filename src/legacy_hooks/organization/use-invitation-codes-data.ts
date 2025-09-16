import { useEffect, useState, useMemo } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvitationCode } from '@/types';

// Global singleton state for invitation codes
const globalInvitationCodesState = {
  listeners: new Map<string, {
    unsubscribe: () => void;
    refCount: number;
    data: InvitationCode[];
    loading: boolean;
    error: string | null;
  }>()
};

function getCacheKey(organizationId: string | undefined): string {
  return `invitation-codes-${organizationId || 'none'}`;
}

export function useInvitationCodesData(organizationId: string | undefined) {
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => getCacheKey(organizationId), [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setInvitationCodes([]);
      setLoading(false);
      return;
    }

    const existingListener = globalInvitationCodesState.listeners.get(cacheKey);

    if (existingListener) {
      // Reuse existing listener
      existingListener.refCount++;
      setInvitationCodes(existingListener.data);
      setLoading(existingListener.loading);
      setError(existingListener.error);

      return () => {
        existingListener.refCount--;
        if (existingListener.refCount === 0) {
          existingListener.unsubscribe();
          globalInvitationCodesState.listeners.delete(cacheKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const invitationCodesQuery = query(
      collection(db, 'invitationCodes'),
      where('organizationId', '==', organizationId),
      where('isUsed', '==', false)
    );

    const unsubscribe = onSnapshot(
      invitationCodesQuery,
      (querySnapshot) => {
        const codes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          expiresAt: doc.data().expiresAt?.toDate(),
        })) as InvitationCode[];

        const listener = globalInvitationCodesState.listeners.get(cacheKey);
        if (listener) {
          listener.data = codes;
          listener.loading = false;
          listener.error = null;
        }
        setInvitationCodes(codes);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invitation codes:', error);
        const listener = globalInvitationCodesState.listeners.get(cacheKey);
        if (listener) {
          listener.loading = false;
          listener.error = error.message;
        }
        setError(error.message);
        setLoading(false);
      }
    );

    // Store the listener
    globalInvitationCodesState.listeners.set(cacheKey, {
      unsubscribe,
      refCount: 1,
      data: [],
      loading: true,
      error: null,
    });

    return () => {
      const listener = globalInvitationCodesState.listeners.get(cacheKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount === 0) {
          listener.unsubscribe();
          globalInvitationCodesState.listeners.delete(cacheKey);
        }
      }
    };
  }, [organizationId, cacheKey]);

  return { invitationCodes, loading, error };
}