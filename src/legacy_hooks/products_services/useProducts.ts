"use client";

import { useMemo, useEffect } from 'react';
import { useAtom } from 'jotai';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useCollectionQuery, useUpdateDocumentMutation, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { useFirestoreDeleteDocument } from '@/lib/firebase/config-query';
import { db } from '@/lib/firebase/config';
import { Product } from '@/types';
import {
  productsAtom,
  productsLoadingAtom,
  productsErrorAtom
} from '@/store/atoms';

export function useProductsData(organizationId: string | undefined) {
  const [products, setProducts] = useAtom(productsAtom);
  const [loading, setLoading] = useAtom(productsLoadingAtom);

  // Always call the hook, but conditionally enable it
  const productsQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'products'),
    {
      queryKey: ['products', organizationId],
      enabled: !!organizationId,
    }
  );

  const productsData = useMemo(() => {
    if (!productsQuery.data) return [];
    return productsQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Product[];
  }, [productsQuery.data]);

  // Update atoms
  useEffect(() => {
    setProducts(productsData);
    setLoading(productsQuery.isLoading);
  }, [productsData, productsQuery.isLoading, setProducts, setLoading]);

  const productsMemo = useMemo(() => products, [products]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      products: [],
      loading: false,
    };
  }

  return {
    products: productsMemo,
    loading,
  };
}

export function useProductActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useAtom(productsErrorAtom);
  const [, setProducts] = useAtom(productsAtom);
  
  const updateProductMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'products', 'dummy')
  );
  
  const addProductMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'products')
  );
  
  const deleteProductMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'products', 'dummy')
  );

  const updateProduct = async (productId: string, productData: Partial<Product>) => {
    if (!organizationId) return;

    setUpdatingStatus(productId);
    try {
      const productRef = doc(db, 'organizations', organizationId, 'products', productId);
      await updateProductMutation.mutateAsync({
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

      const docRef = await addProductMutation.mutateAsync(cleanedData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!organizationId) return;

    try {
      const productRef = doc(db, 'organizations', organizationId, 'products', productId);
      await deleteProductMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      updateProduct: async () => {},
      createProduct: async () => {},
      deleteProduct: async () => {},
      updatingStatus: null,
    };
  }

  return {
    updateProduct,
    createProduct,
    deleteProduct,
    updatingStatus,
  };
}