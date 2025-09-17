import { Product } from '@/types';
import {
  getPurchaseProducts,
  getPurchaseProduct,
  createPurchaseProduct,
  updatePurchaseProduct,
  deletePurchaseProduct
} from '../firebase/firestore/purchaseProducts';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface PurchaseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

interface PurchaseProductsActions {
  getProductById: (productId: string) => Promise<Product | null>;
  createNewProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateExistingProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
  deleteExistingProduct: (productId: string) => Promise<void>;
}

/**
 * Hook that provides real-time purchase products for the selected organization
 */
export function usePurchaseProducts(): PurchaseProductsState & PurchaseProductsActions {
  const { selectedOrganization } = useOrganization();

  const { data: products, loading, error } = useRealtimeCollection<Product>(
    'purchaseProducts',
    selectedOrganization?.id || null
  );

  const getProductById = async (productId: string): Promise<Product | null> => {
    try {
      return await getPurchaseProduct(productId);
    } catch (err) {
      console.error('Error fetching purchase product:', err);
      throw err;
    }
  };

  const createNewProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const productId = await createPurchaseProduct(productData);
      // Real-time listener will automatically update the products list
      return productId;
    } catch (err) {
      console.error('Error creating purchase product:', err);
      throw err;
    }
  };

  const updateExistingProduct = async (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      await updatePurchaseProduct(productId, updates);
      // Real-time listener will automatically update the products list
    } catch (err) {
      console.error('Error updating purchase product:', err);
      throw err;
    }
  };

  const deleteExistingProduct = async (productId: string): Promise<void> => {
    try {
      await deletePurchaseProduct(productId);
      // Real-time listener will automatically update the products list
    } catch (err) {
      console.error('Error deleting purchase product:', err);
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    getProductById,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
  };
}

/**
 * Hook that provides purchase products data only (for usePurchaseProductsData compatibility)
 */
export function usePurchaseProductsData(organizationId?: string): { products: Product[]; loading: boolean } {
  const { selectedOrganization } = useOrganization();
  const orgId = organizationId || selectedOrganization?.id;

  const { data: products, loading } = useRealtimeCollection<Product>(
    'purchaseProducts',
    orgId || null
  );

  return { products, loading };
}

/**
 * Hook that provides purchase products actions only (for usePurchaseProductsActions compatibility)
 */
export function usePurchaseProductsActions(organizationId?: string): {
  createProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  deleteProduct: (productId: string) => Promise<void>;
} {
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const productId = await createPurchaseProduct(productData);
      return productId;
    } catch (err) {
      console.error('Error creating purchase product:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await deletePurchaseProduct(productId);
    } catch (err) {
      console.error('Error deleting purchase product:', err);
      throw err;
    }
  };

  return {
    createProduct,
    deleteProduct,
  };
}