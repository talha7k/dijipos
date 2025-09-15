"use client";

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Service, Category } from '@/types';

export function usePurchaseProductsData(organizationId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setProducts([]);
      return;
    }

    // Fetch purchase products with real-time updates
    const productsQ = query(collection(db, 'organizations', organizationId, 'purchase-products'));
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
      console.error('Error fetching purchase products:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    products,
    loading,
  };
}

export function usePurchaseServicesData(organizationId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      setServices([]);
      return;
    }

    // Fetch purchase services with real-time updates
    const servicesQ = query(collection(db, 'organizations', organizationId, 'purchase-services'));
    const unsubscribe = onSnapshot(servicesQ, (querySnapshot) => {
      const servicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Service[];
      setServices(servicesData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching purchase services:', error);
      setLoading(false);
    });

    // Return cleanup function
    return () => unsubscribe();
  }, [organizationId]);

  return {
    services,
    loading,
  };
}

export function usePurchaseProductsActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

      await addDoc(collection(db, 'organizations', organizationId, 'purchase-products'), cleanedData);
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
      await deleteDoc(doc(db, 'organizations', organizationId, 'purchase-products', productId));
    } catch (error) {
      console.error('Error deleting purchase product:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  return {
    createProduct,
    deleteProduct,
    updatingStatus,
  };
}

export function usePurchaseServicesActions(organizationId: string | undefined) {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

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

      await addDoc(collection(db, 'organizations', organizationId, 'purchase-services'), cleanedData);
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
      await deleteDoc(doc(db, 'organizations', organizationId, 'purchase-services', serviceId));
    } catch (error) {
      console.error('Error deleting purchase service:', error);
      throw error;
    } finally {
      setUpdatingStatus(null);
    }
  };

  return {
    createService,
    deleteService,
    updatingStatus,
  };
}