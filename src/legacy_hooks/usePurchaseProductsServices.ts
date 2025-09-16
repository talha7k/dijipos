"use client";

import { useState, useMemo } from 'react';
import { collection, doc } from 'firebase/firestore';
import { useCollectionQuery, useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Product, Service } from '@/types';

export function usePurchaseProductsData(organizationId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);

  // Always call the hook, but conditionally enable it
  const productsQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-products'),
    {
      queryKey: ['purchaseProducts', organizationId],
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

  // Update state
  useMemo(() => {
    setProducts(productsData);
  }, [productsData]);

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
    loading: productsQuery.isLoading,
  };
}

export function usePurchaseServicesData(organizationId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);

  // Always call the hook, but conditionally enable it
  const servicesQuery = useCollectionQuery(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-services'),
    {
      queryKey: ['purchaseServices', organizationId],
      enabled: !!organizationId,
    }
  );

  const servicesData = useMemo(() => {
    if (!servicesQuery.data) return [];
    return servicesQuery.data.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Service[];
  }, [servicesQuery.data]);

  // Update state
  useMemo(() => {
    setServices(servicesData);
  }, [servicesData]);

  const servicesMemo = useMemo(() => services, [services]);

  // Return empty data when no organizationId
  if (!organizationId) {
    return {
      services: [],
      loading: false,
    };
  }

  return {
    services: servicesMemo,
    loading: servicesQuery.isLoading,
  };
}

export function usePurchaseProductsActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const addProductMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-products')
  );
  
  const deleteProductMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'purchase-products', 'dummy')
  );

  const createProduct = async (productData: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) => {
    if (!organizationId) return;

    setUpdatingStatus('creating');
    try {
      const cleanedData = {
        name: productData.name,
        description: productData.description || null,
        price: productData.price,
        category: productData.category,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addProductMutation.mutateAsync(cleanedData);
    } catch (error) {
      console.error('Error creating purchase product:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!organizationId) return;

    setUpdatingStatus(productId);
    try {
      const productRef = doc(db, 'organizations', organizationId, 'purchase-products', productId);
      await deleteProductMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting purchase product:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      createProduct: async () => {},
      deleteProduct: async () => {},
      updatingStatus: null,
    };
  }

  return {
    createProduct,
    deleteProduct,
    updatingStatus,
  };
}

export function usePurchaseServicesActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  
  const addServiceMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'purchase-services')
  );
  
  const deleteServiceMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'purchase-services', 'dummy')
  );

  const createService = async (serviceData: {
    name: string;
    description: string;
    price: number;
    category: string;
  }) => {
    if (!organizationId) return;

    setUpdatingStatus('creating');
    try {
      const cleanedData = {
        name: serviceData.name,
        description: serviceData.description || null,
        price: serviceData.price,
        category: serviceData.category,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addServiceMutation.mutateAsync(cleanedData);
    } catch (error) {
      console.error('Error creating purchase service:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!organizationId) return;

    setUpdatingStatus(serviceId);
    try {
      const serviceRef = doc(db, 'organizations', organizationId, 'purchase-services', serviceId);
      await deleteServiceMutation.mutateAsync();
    } catch (error) {
      console.error('Error deleting purchase service:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Return empty functions when no organizationId
  if (!organizationId) {
    return {
      createService: async () => {},
      deleteService: async () => {},
      updatingStatus: null,
    };
  }

  return {
    createService,
    deleteService,
    updatingStatus,
  };
}