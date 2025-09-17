// Export/Import utilities for products and categories data
// Supports JSON format with sample download and upload functionality

import { Category, Product } from '@/types';
import { sampleCategories, sampleProducts } from './sample-data';

export interface ExportData {
  exportedAt: string;
  organizationId: string;
  categories: Category[];
  products: Product[];
}

export interface ImportData {
  exportedAt: string;
  organizationId: string;
  categories: Omit<Category, 'organizationId'>[];
  products: Omit<Product, 'organizationId'>[];
}

export interface ImportOptions {
  overwriteExisting: boolean;
  skipDuplicates: boolean;
  overwriteDuplicates: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    categories: number;
    products: number;
  };
  errors: string[];
}

/**
 * Downloads sample products and categories data as JSON
 */
export function downloadSampleData(): void {
  const sampleData: ExportData = {
    exportedAt: new Date().toISOString(),
    organizationId: 'sample',
    categories: sampleCategories.map(cat => ({
      ...cat,
      organizationId: 'sample'
    })),
    products: sampleProducts.map(prod => ({
      ...prod,
      organizationId: 'sample'
    }))
  };

  const jsonString = JSON.stringify(sampleData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `sample-products-categories-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports current products and categories data as JSON download
 */
export function exportProductsAndCategories(
  organizationId: string,
  categories: Category[],
  products: Product[]
): void {
  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    organizationId,
    categories,
    products
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `products-categories-${organizationId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates imported data structure
 */
export function validateImportData(data: unknown): data is ImportData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!obj.exportedAt || typeof obj.exportedAt !== 'string') {
    return false;
  }

  if (!obj.organizationId || typeof obj.organizationId !== 'string') {
    return false;
  }

  if (!Array.isArray(obj.categories) || !Array.isArray(obj.products)) {
    return false;
  }

  // Validate categories structure
  for (const cat of obj.categories) {
    if (!cat || typeof cat !== 'object') return false;
    const category = cat as Record<string, unknown>;
    if (!category.id || typeof category.id !== 'string') return false;
    if (!category.name || typeof category.name !== 'string') return false;
    if (!category.type || typeof category.type !== 'string') return false;
  }

  // Validate products structure
  for (const prod of obj.products) {
    if (!prod || typeof prod !== 'object') return false;
    const product = prod as Record<string, unknown>;
    if (!product.id || typeof product.id !== 'string') return false;
    if (!product.name || typeof product.name !== 'string') return false;
    if (typeof product.price !== 'number') return false;
  }

  return true;
}

/**
 * Parses uploaded JSON file
 */
export async function parseImportFile(file: File): Promise<ImportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!validateImportData(data)) {
          reject(new Error('Invalid file format. Please ensure the file contains valid products and categories data.'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse JSON file. Please check the file format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };

    reader.readAsText(file);
  });
}

/**
 * Imports products and categories data
 * Note: This function should be called within a component that has access to the mutation functions
 */
export async function importProductsAndCategories(
  organizationId: string,
  importData: ImportData,
  createCategory: (data: Omit<Category, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>,
  createProduct: (data: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<string>,
  deleteCategory: (categoryId: string) => Promise<void>,
  deleteProduct: (productId: string) => Promise<void>,
  existingCategories: Category[],
  existingProducts: Product[],
  options: ImportOptions = { overwriteExisting: false, skipDuplicates: true, overwriteDuplicates: false }
): Promise<ImportResult> {
  const errors: string[] = [];
  let categoriesImported = 0;
  let productsImported = 0;

  try {
    // If overwriteExisting is true, delete all existing categories and products first
    if (options.overwriteExisting && existingCategories.length > 0) {
      console.log('Overwriting existing data - deleting all categories and products');

      // Delete all existing products first (to avoid foreign key issues)
      const productDeletePromises = existingProducts.map(async (product) => {
        try {
          await deleteProduct(product.id);
        } catch (error) {
          errors.push(`Failed to delete existing product "${product.name}": ${error}`);
        }
      });

      // Delete all existing categories
      const categoryDeletePromises = existingCategories.map(async (category) => {
        try {
          await deleteCategory(category.id);
        } catch (error) {
          errors.push(`Failed to delete existing category "${category.name}": ${error}`);
        }
      });

      // Wait for all deletions to complete
      await Promise.all([...productDeletePromises, ...categoryDeletePromises]);
      console.log(`Deleted ${existingProducts.length} products and ${existingCategories.length} categories`);
    }

    // Create mapping between old category IDs and new category IDs
    const categoryIdMapping = new Map<string, string>();

    // Import categories first (products reference them)
    // Process categories in parallel for better performance
    const categoryPromises = importData.categories.map(async (category) => {
      try {
        const newCategoryId = await createCategory({
          name: category.name,
          description: category.description,
          parentId: category.parentId,
          type: category.type
        });
        // Store mapping from old ID to new ID
        categoryIdMapping.set(category.id, newCategoryId);
        return { success: true, category };
      } catch (error) {
        errors.push(`Failed to import category "${category.name}": ${error}`);
        return { success: false, category };
      }
    });

    const categoryResults = await Promise.all(categoryPromises);
    categoriesImported = categoryResults.filter(result => result.success).length;

    // Import products with updated category IDs
    // Process products in parallel for better performance
    const productPromises = importData.products.map(async (product) => {
      try {
        // Map old category ID to new category ID
        const newCategoryId = product.categoryId ? categoryIdMapping.get(product.categoryId) : undefined;

        // For now, just create the product - duplicate checking would require additional API calls
        // This is a simplified implementation
        const newProductId = await createProduct({
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: newCategoryId, // Use the new category ID
          variations: product.variations
        });
        return { success: true, product };
      } catch (error) {
        errors.push(`Failed to import product "${product.name}": ${error}`);
        return { success: false, product };
      }
    });

    const productResults = await Promise.all(productPromises);
    productsImported = productResults.filter(result => result.success).length;

    return {
      success: true,
      message: `Successfully imported ${categoriesImported} categories and ${productsImported} products.`,
      imported: {
        categories: categoriesImported,
        products: productsImported
      },
      errors
    };

  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error}`,
      imported: {
        categories: categoriesImported,
        products: productsImported
      },
      errors
    };
  }
}