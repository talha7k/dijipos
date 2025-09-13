import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

export function useCategoriesData(organizationId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    // Fetch categories with real-time updates
    const categoriesQ = query(collection(db, 'tenants', organizationId, 'categories'));
    const unsubscribe = onSnapshot(categoriesQ, (querySnapshot) => {
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[];
      setCategories(categoriesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching categories:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    categories,
    loading,
  };
}

export function useCategoryActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const updateCategory = async (categoryId: string, categoryData: Partial<Category>) => {
    if (!organizationId) return;

    setUpdatingStatus(categoryId);
    try {
      const categoryRef = doc(db, 'tenants', organizationId, 'categories', categoryId);
      await updateDoc(categoryRef, {
        ...categoryData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...categoryData,
        description: categoryData.description || null,
        parentId: categoryData.parentId || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'tenants', organizationId, 'categories'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'tenants', organizationId, 'categories', categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return {
    updateCategory,
    createCategory,
    deleteCategory,
    updatingStatus,
  };
}