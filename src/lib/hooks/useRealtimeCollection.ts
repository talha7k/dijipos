import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase/config';

interface RealtimeCollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/**
 * Generic hook for real-time Firestore collection listening
 * @param collectionName - The Firestore collection name
 * @param organizationId - Organization ID to filter by
 * @param additionalConstraints - Optional additional query constraints
 * @param orderByField - Field to order by (default: 'createdAt')
 * @param orderDirection - Order direction (default: 'desc')
 */
export function useRealtimeCollection<T extends { id: string }>(
  collectionName: string,
  organizationId: string | null,
  additionalConstraints: QueryConstraint[] = [],
  orderByField: string = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): RealtimeCollectionState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where('organizationId', '==', organizationId),
      orderBy(orderByField, orderDirection),
      ...additionalConstraints,
    ];

    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);

    // Set up real-time listener
    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const documents = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Convert Firestore Timestamps to Date objects
            ...(doc.data().createdAt && {
              createdAt: doc.data().createdAt.toDate(),
            }),
            ...(doc.data().updatedAt && {
              updatedAt: doc.data().updatedAt.toDate(),
            }),
          })) as T[];

          setData(documents);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error(`Error processing ${collectionName} snapshot:`, err);
          setError(`Failed to process ${collectionName} data`);
          setLoading(false);
        }
      },
      (err) => {
        console.error(`Error listening to ${collectionName}:`, err);
        setError(err.message || `Failed to listen to ${collectionName}`);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount or dependency change
    return () => {
      unsubscribe();
    };
  }, [collectionName, organizationId, orderByField, orderDirection, additionalConstraints.length]);

  return {
    data,
    loading,
    error,
  };
}