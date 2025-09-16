import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, QueryConstraint, runTransaction, Transaction } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { useAddDocumentMutation, useDeleteDocumentMutation, useSetDocumentMutation, useUpdateDocumentMutation, useRunTransactionMutation, useWaitForPendingWritesQuery } from '@tanstack-query-firebase/react/firestore';
import { DocumentReference, CollectionReference, DocumentData } from 'firebase/firestore';

// Generic Firestore collection query hook with real-time support
export function useFirestoreCollectionQuery<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = [],
  options: { 
    enabled?: boolean; 
    staleTime?: number;
    realtime?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: [collectionPath, ...constraints.map(c => JSON.stringify(c))],
    queryFn: async () => {
      if (options.realtime) {
        // For real-time queries, return a promise that resolves with initial data
        return new Promise<T[]>((resolve, reject) => {
          const q = query(collection(db, collectionPath), ...constraints);
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            try {
              const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Convert Firestore timestamps to Date objects
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate(),
              })) as T[];
              resolve(data);
            } catch (err) {
              reject(err);
            }
          }, (err) => {
            reject(err);
          });

          // Cleanup function will be called by React Query when the query is cancelled
          return () => unsubscribe();
        });
      } else {
        // For one-time queries
        const q = query(collection(db, collectionPath), ...constraints);
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamps to Date objects
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as T[];
      }
    },
    ...options,
  });
}

// Generic Firestore document query hook with real-time support
export function useFirestoreDocumentQuery<T>(
  collectionPath: string,
  docId: string,
  options: { 
    enabled?: boolean; 
    staleTime?: number;
    realtime?: boolean;
  } = {}
) {
  return useQuery({
    queryKey: [collectionPath, docId],
    queryFn: async () => {
      if (options.realtime) {
        // For real-time queries
        return new Promise<T | null>((resolve, reject) => {
          const docRef = doc(db, collectionPath, docId);
          const unsubscribe = onSnapshot(docRef, (docSnap) => {
            try {
              if (docSnap.exists()) {
                const data = docSnap.data();
                resolve({
                  id: docSnap.id,
                  ...data,
                  // Convert Firestore timestamps to Date objects
                  createdAt: data.createdAt?.toDate(),
                  updatedAt: data.updatedAt?.toDate(),
                } as T);
              } else {
                resolve(null);
              }
            } catch (err) {
              reject(err);
            }
          }, (err) => {
            reject(err);
          });

          return () => unsubscribe();
        });
      } else {
        // For one-time queries
        const docRef = doc(db, collectionPath, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            // Convert Firestore timestamps to Date objects
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
          } as T;
        }
        return null;
      }
    },
    ...options,
  });
}

// Wrapper hooks for mutations using @tanstack-query-firebase/react/firestore
export function useFirestoreAddDocument<T extends DocumentData>(collectionRef: CollectionReference<T>) {
  return useAddDocumentMutation<T>(collectionRef);
}

export function useFirestoreDeleteDocument<T extends DocumentData>(documentRef: DocumentReference<T>) {
  return useDeleteDocumentMutation<T>(documentRef);
}

export function useFirestoreSetDocument<T extends DocumentData>(documentRef: DocumentReference<T>) {
  return useSetDocumentMutation<T>(documentRef);
}

export function useFirestoreUpdateDocument<T extends DocumentData>(documentRef: DocumentReference<T>) {
  return useUpdateDocumentMutation<T>(documentRef);
}

export function useFirestoreRunTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>) {
  return useRunTransactionMutation<T>(db, updateFunction);
}

export function useFirestoreWaitForPendingWrites() {
  return useWaitForPendingWritesQuery(db, { queryKey: ['pendingWrites'] });
}

// Generic Firestore mutation hooks with optimistic updates (kept for backward compatibility)
export function useFirestoreAdd<T extends { id?: string }>(collectionPath: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<T, 'id'>) => {
      const docRef = await addDoc(collection(db, collectionPath), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { id: docRef.id, ...data } as T;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [collectionPath] });
      
      // Snapshot of previous value
      const previousData = queryClient.getQueryData([collectionPath]);
      
      // Optimistically update to the new value
      queryClient.setQueryData([collectionPath], (old: T[] = []) => [
        ...old,
        {
          id: 'temp-id',
          ...newData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as T
      ]);
      
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([collectionPath], context.previousData);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
    },
  });
}

export function useFirestoreUpdate<T>(collectionPath: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
      return { id, ...data };
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: [newData.id] });
      await queryClient.cancelQueries({ queryKey: [collectionPath] });
      
      const previousData = queryClient.getQueryData([collectionPath]);
      const previousDocData = queryClient.getQueryData([collectionPath, newData.id]);
      
      // Optimistically update
      queryClient.setQueryData([collectionPath], (old: T[] = []) =>
        old.map(item => (item as { id?: string }).id === newData.id ? { ...item, ...newData.data, updatedAt: new Date() } as T : item)
      );
      
      queryClient.setQueryData([collectionPath, newData.id], (old: T | null) =>
        old ? { ...old, ...newData.data, updatedAt: new Date() } as T : null
      );
      
      return { previousData, previousDocData };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([collectionPath], context.previousData);
      }
      if (context?.previousDocData !== undefined) {
        queryClient.setQueryData([collectionPath, newData.id], context.previousDocData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
    },
  });
}

export function useFirestoreDelete<T extends { id?: string }>(collectionPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: [collectionPath] });

      const previousData = queryClient.getQueryData([collectionPath]);

      // Optimistically remove from cache
      queryClient.setQueryData([collectionPath], (old: T[] = []) =>
        old.filter((item: T) => (item as { id?: string }).id !== id)
      );

      return { previousData };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData([collectionPath], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [collectionPath] });
    },
  });
}

// Utility function to create query keys
export const createFirestoreQueryKeys = {
  all: (collectionPath: string) => [collectionPath] as const,
  lists: (collectionPath: string) => [...createFirestoreQueryKeys.all(collectionPath), 'list'] as const,
  list: (collectionPath: string, ...constraints: QueryConstraint[]) => 
    [...createFirestoreQueryKeys.lists(collectionPath), ...constraints.map(c => JSON.stringify(c))] as const,
  details: (collectionPath: string) => [...createFirestoreQueryKeys.all(collectionPath), 'detail'] as const,
  detail: (collectionPath: string, docId: string) => [...createFirestoreQueryKeys.details(collectionPath), docId] as const,
};