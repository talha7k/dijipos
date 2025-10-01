import { useState, useEffect, useCallback } from 'react';
import { Category } from '@/types';
import {
  getCategories,
  getCategory,
  createCategory as firestoreCreateCategory,
  updateCategory as firestoreUpdateCategory,
  deleteCategory as firestoreDeleteCategory
} from '@/lib/firebase/firestore/categories';
import { useOrganization } from './useOrganization';

export interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export interface CategoriesActions {
  createCategory: (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCategory: (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getCategoryById: (categoryId: string) => Promise<Category | null>;
  refreshCategories: () => Promise<void>;
}

export function useCategories(): CategoriesState & CategoriesActions {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories when organization changes
  const loadCategories = useCallback(async () => {
    if (!organizationId) {
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedCategories = await getCategories(organizationId);
      setCategories(fetchedCategories);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load categories';
      setError(errorMessage);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  // Load categories on mount and when organization changes
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const createCategory = useCallback(async (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }

    try {
      const fullCategoryData = {
        ...categoryData,
        organizationId,
      };

      const categoryId = await firestoreCreateCategory(fullCategoryData);

      // Refresh categories list
      await loadCategories();

      return categoryId;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }, [organizationId, loadCategories]);

  const updateCategory = useCallback(async (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await firestoreUpdateCategory(categoryId, updates);

      // Update local state
      setCategories(prevCategories =>
        prevCategories.map(category =>
          category.id === categoryId
            ? { ...category, ...updates, updatedAt: new Date() }
            : category
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string): Promise<void> => {
    try {
      await firestoreDeleteCategory(categoryId);

      // Update local state
      setCategories(prevCategories => prevCategories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }, []);

  const getCategoryById = useCallback(async (categoryId: string): Promise<Category | null> => {
    try {
      return await getCategory(categoryId);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }, []);

  const refreshCategories = useCallback(async (): Promise<void> => {
    await loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    refreshCategories,
  };
}