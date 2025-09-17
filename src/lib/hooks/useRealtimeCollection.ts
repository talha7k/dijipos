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
  orderByField: string | null = 'createdAt',
  orderDirection: 'asc' | 'desc' = 'desc'
): RealtimeCollectionState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // More defensive check for organizationId
    if (!organizationId || organizationId === null || organizationId === undefined || organizationId === '') {
      console.log(`useRealtimeCollection: Skipping query for ${collectionName} - no organizationId (${organizationId})`);
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`useRealtimeCollection: Setting up listener for ${collectionName} with organizationId: ${organizationId}`);

    setLoading(true);
    setError(null);

    let isMounted = true; // Track if component is still mounted

    // Add a small delay to ensure organization is fully loaded
    const setupTimeout = setTimeout(() => {
      if (!isMounted) return; // Don't proceed if component unmounted

      try {
        // Build query constraints - use useMemo-like approach to stabilize constraints
        const baseConstraints: QueryConstraint[] = [
          where('organizationId', '==', organizationId),
        ];

        // Add additional constraints
        const allConstraints = [...baseConstraints, ...additionalConstraints];

        // Only add orderBy if a field is specified
        if (orderByField) {
          allConstraints.push(orderBy(orderByField, orderDirection));
        }

        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, ...allConstraints);

        console.log(`useRealtimeCollection: Executing query for ${collectionName}`);

        // Set up real-time listener
        const unsubscribe: Unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return; // Don't update state if component unmounted

            try {
              console.log(`useRealtimeCollection: Received snapshot for ${collectionName} with ${snapshot.docs.length} documents`);
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
              if (isMounted) {
                setError(`Failed to process ${collectionName} data`);
                setLoading(false);
              }
            }
          },
          (err) => {
            console.error(`Error listening to ${collectionName}:`, err);
            if (isMounted) {
              setError(err.message || `Failed to listen to ${collectionName}`);
              setLoading(false);
            }
          }
        );

        // Cleanup listener on unmount or dependency change
        return () => {
          console.log(`useRealtimeCollection: Cleaning up listener for ${collectionName}`);
          isMounted = false;
          unsubscribe();
        };
      } catch (err) {
        console.error(`Error setting up ${collectionName} listener:`, err);
        if (isMounted) {
          setError(`Failed to set up ${collectionName} listener`);
          setLoading(false);
        }
      }
    }, 100); // Small delay to ensure organization is fully loaded

    return () => {
      isMounted = false;
      clearTimeout(setupTimeout);
    };
  }, [collectionName, organizationId, orderByField, orderDirection, JSON.stringify(additionalConstraints)]);

  return {
    data,
    loading,
    error,
  };
}