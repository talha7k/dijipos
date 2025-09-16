'use client';

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useAddDocumentMutation, useUpdateDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase/config';
import { Category } from '@/types';

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

  // Always call the hook, but conditionally enable it
  const categoriesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'categories'),
    {
      queryKey: ['categories', organizationId],
      enabled: !!organizationId,
    }
  );

  const categoriesData = useMemo(() => {
    if (!categoriesQuery.data) return [];
    return categoriesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  }, [categoriesQuery.data]);

  // Update state
  useMemo(() => {
    setCategories(categoriesData);
    setLoading(categoriesQuery.isLoading);
    setError(categoriesQuery.error?.message || null);
  }, [categoriesData, categoriesQuery.isLoading, categoriesQuery.error]);

  const addCategoryMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'categories')
  );
  
  const updateCategoryMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'categories', 'dummy')
  );
  
  const deleteCategoryMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'categories', 'dummy')
  );

  const createCategory = async (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      await addCategoryMutation.mutateAsync({
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
      const categoryRef = doc(db, 'organizations', organizationId, 'categories', id);
      await updateCategoryMutation.mutateAsync({
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
      const categoryRef = doc(db, 'organizations', organizationId, 'categories', id);
      await deleteCategoryMutation.mutateAsync();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const categoriesMemo = useMemo(() => categories, [categories]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      categories: [],
      loading: false,
      error: null,
      createCategory: async () => {},
      updateCategory: async () => {},
      deleteCategory: async () => {},
    };
  }

  return {
    categories: categoriesMemo,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory
  };
}