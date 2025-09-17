import { Product, Category } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook that provides real-time products and categories for the selected organization
 */
export function useProducts(): ProductsState {
  const { selectedOrganization } = useOrganization();

  const {
    data: products,
    loading: productsLoading,
    error: productsError
  } = useRealtimeCollection<Product>('products', selectedOrganization?.id || null, [], null); // Disable orderBy to prevent index errors

  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError
  } = useRealtimeCollection<Category>('categories', selectedOrganization?.id || null, [], null); // Disable orderBy to prevent index errors

  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  return {
    products,
    categories,
    loading,
    error,
  };
}