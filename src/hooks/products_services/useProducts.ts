"use client";

import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { collection, query, onSnapshot, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';
import {
  productsAtom,
  productsLoadingAtom,
  productsErrorAtom
} from '@/store/atoms';

// Global singleton to prevent duplicate listeners
const globalProductListeners = new Map<string, {
  unsubscribe: () => void;
  refCount: number;
}>();

export function useProductsData(organizationId: string | undefined) {
  const [products, setProducts] = useAtom(productsAtom);
  const [loading, setLoading] = useAtom(productsLoadingAtom);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setProducts([]);
      return;
    }

    const listenerKey = `products-${organizationId}`;
    
    // Check if listener already exists
    if (globalProductListeners.has(listenerKey)) {
      const existing = globalProductListeners.get(listenerKey)!;
      existing.refCount++;
      setLoading(false);
      return () => {
        existing.refCount--;
        if (existing.refCount <= 0) {
          existing.unsubscribe();
          globalProductListeners.delete(listenerKey);
        }
      };
    }

    // Create new listener
    setLoading(true);
    const productsQ = query(collection(db, 'organizations', organizationId, 'products'));
    const unsubscribe = onSnapshot(productsQ, (querySnapshot) => {
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching products:', error);
      setLoading(false);
    });

    // Store in global singleton
    globalProductListeners.set(listenerKey, {
      unsubscribe,
      refCount: 1
    });

    // Return cleanup function
    return () => {
      const listener = globalProductListeners.get(listenerKey);
      if (listener) {
        listener.refCount--;
        if (listener.refCount <= 0) {
          listener.unsubscribe();
          globalProductListeners.delete(listenerKey);
        }
      }
    };
  }, [organizationId, setProducts, setLoading]);

  const productsMemo = useMemo(() => products, [products]);

  return {
    products: productsMemo,
    loading,
  };
}

export function useProductActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(productsErrorAtom);

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    if (!organizationId) return;

    setUpdatingStatus(productId);
    try {
      const productRef = doc(db, 'organizations', organizationId, 'products', productId);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    try {
      const cleanedData = {
        ...productData,
        description: productData.description || null,
        categoryId: productData.categoryId || null,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'organizations', organizationId, 'products'), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!organizationId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'products', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    updateProduct,
    createProduct,
    deleteProduct,
    updatingStatus,
  };
}