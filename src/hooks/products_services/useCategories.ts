'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

// Global singleton to prevent duplicate listeners
const globalCategoryListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export interface UseCategoriesDataResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  createCategory: (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategoriesData(organizationId: string | undefined): UseCategoriesDataResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const listenerKey = `categories-${organizationId}`;
    
    // Check if listener already exists
    if (globalCategoryListeners.has(listenerKey)) {
      const existing = globalCategoryListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalCategoryListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    setError(null);

    const categoriesQuery = query(collection(db, 'organizations', organizationId, 'categories'));

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        setLoading(false);
      }
    );

    // Store in global singleton
    globalCategoryListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    return () => {
      const listener = globalCategoryListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalCategoryListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId]);

  const createCategory = async (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      await addDoc(collection(db, 'organizations', organizationId, 'categories'), {
        ...categoryData,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!organizationId) return;

    try {
      await updateDoc(doc(db, 'organizations', organizationId, 'categories', id), {
        ...updates,
        updatedAt: new Date()
      });
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'categories', id));
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const categoriesMemo = useMemo(() => categories, [categories]);

  return {
    categories: categoriesMemo,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
}