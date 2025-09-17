import { Product, Category } from '@/types';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useOrganization } from './useOrganization';
import { createProduct as firestoreCreateProduct, updateProduct as firestoreUpdateProduct, deleteProduct as firestoreDeleteProduct } from '@/lib/firebase/firestore/products';
import { createCategory as firestoreCreateCategory, updateCategory as firestoreUpdateCategory, deleteCategory as firestoreDeleteCategory } from '@/lib/firebase/firestore/categories';
import { toast } from 'sonner';

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

interface ProductsActions {
  createProduct: (productData: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  createCategory: (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCategory: (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

/**
 * Hook that provides real-time products, categories and CRUD operations for the selected organization
 */
export function useProducts(): ProductsState & ProductsActions {
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

  const createProduct = async (productData: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullProductData = {
        ...productData,
        organizationId: selectedOrganization.id,
      };
      const productId = await firestoreCreateProduct(fullProductData);
      toast.success('Product created successfully');
      return productId;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdateProduct(productId, updates);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await firestoreDeleteProduct(productId);
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      throw error;
    }
  };

  const createCategory = async (categoryData: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedOrganization?.id) {
      throw new Error('No organization selected');
    }

    try {
      const fullCategoryData = {
        ...categoryData,
        organizationId: selectedOrganization.id,
      };
      const categoryId = await firestoreCreateCategory(fullCategoryData);
      toast.success('Category created successfully');
      return categoryId;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      throw error;
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    try {
      await firestoreUpdateCategory(categoryId, updates);
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await firestoreDeleteCategory(categoryId);
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    }
  };

  return {
    products,
    categories,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}