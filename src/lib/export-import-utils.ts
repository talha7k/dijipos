// Export/Import utilities for products and categories data
// Supports JSON format with sample download and upload functionality

import { Category, Item } from "@/types";
import {
  sampleCategories,
  sampleProducts,
  sampleServices,
} from "./sample-data";

export interface ExportData {
  exportedAt: string;
  organizationId: string;
  categories: Category[];
  items: Item[];
}

export interface ImportData {
  exportedAt: string;
  organizationId: string;
  categories: Omit<Category, "organizationId">[];
  items: Omit<Item, "organizationId">[];
}

export interface ImportOptions {
  overwriteExisting: boolean;
  skipDuplicates: boolean;
  overwriteDuplicates: boolean;
}

export interface ImportProgress {
  currentStep: string;
  categoriesProcessed: number;
  totalCategories: number;
  itemsProcessed: number;
  totalItems: number;
  currentCategory?: string;
  currentItem?: string;
}

export interface ImportProgressCallback {
  (progress: ImportProgress): void;
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    categories: number;
    items: number;
  };
  errors: string[];
}

/**
 * Downloads sample products and categories data as JSON
 */
export function downloadSampleData(): void {
  const sampleData: ExportData = {
    exportedAt: new Date().toISOString(),
    organizationId: "sample",
    categories: sampleCategories.map((cat) => ({
      ...cat,
      organizationId: "sample",
    })),
    items: [...sampleProducts, ...sampleServices].map((item) => ({
      ...item,
      organizationId: "sample",
    })),
  };

  const jsonString = JSON.stringify(sampleData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `sample-products-categories-${new Date().toISOString().split("T")[0]}.json`;
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
  items: Item[],
): void {
  const exportData: ExportData = {
    exportedAt: new Date().toISOString(),
    organizationId,
    categories,
    items,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `products-categories-${organizationId}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates imported data structure
 */
export function validateImportData(data: unknown): data is ImportData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!obj.exportedAt || typeof obj.exportedAt !== "string") {
    return false;
  }

  if (!obj.organizationId || typeof obj.organizationId !== "string") {
    return false;
  }

  if (
    !Array.isArray(obj.categories) ||
    !Array.isArray(obj.items)
  ) {
    return false;
  }

  // Validate categories structure
  for (const cat of obj.categories) {
    if (!cat || typeof cat !== "object") return false;
    const category = cat as Record<string, unknown>;
    if (!category.id || typeof category.id !== "string") return false;
    if (!category.name || typeof category.name !== "string") return false;
    if (!category.type || typeof category.type !== "string") return false;
    if (!category.transactionType || typeof category.transactionType !== "string") return false;
  }

  // Validate items structure
  for (const item of obj.items) {
    if (!item || typeof item !== "object") return false;
    const itemData = item as Record<string, unknown>;
    if (!itemData.id || typeof itemData.id !== "string") return false;
    if (!itemData.name || typeof itemData.name !== "string") return false;
    if (typeof itemData.price !== "number") return false;
    if (!itemData.itemType || typeof itemData.itemType !== "string") return false;
    if (!itemData.transactionType || typeof itemData.transactionType !== "string") return false;
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
          reject(
            new Error(
              "Invalid file format. Please ensure the file contains valid products and categories data.",
            ),
          );
          return;
        }

        resolve(data);
      } catch (error) {
        reject(
          new Error("Failed to parse JSON file. Please check the file format."),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file."));
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
  createCategory: (
    data: Omit<Category, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => Promise<string>,
  createItem: (
    data: Omit<Item, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => Promise<string>,
  deleteCategory: (categoryId: string) => Promise<void>,
  deleteItem: (itemId: string) => Promise<void>,
  existingCategories: Category[],
  existingItems: Item[],
  options: ImportOptions = {
    overwriteExisting: false,
    skipDuplicates: true,
    overwriteDuplicates: false,
  },
  progressCallback?: ImportProgressCallback,
): Promise<ImportResult> {
  const errors: string[] = [];
  let categoriesImported = 0;
  let itemsImported = 0;

  const reportProgress = (step: string, extra: Partial<ImportProgress> = {}) => {
    if (progressCallback) {
      progressCallback({
        currentStep: step,
        categoriesProcessed: categoriesImported,
        totalCategories: importData.categories.length,
        itemsProcessed: itemsImported,
        totalItems: importData.items.length,
        ...extra,
      });
    }
  };

  try {
    // If overwriteExisting is true, delete all existing categories and items first
    if (options.overwriteExisting && existingCategories.length > 0) {
      reportProgress("Clearing existing data...");
      
      console.log(
        "Overwriting existing data - deleting all categories and items",
      );

      // Delete all existing items first (to avoid foreign key issues)
      const itemDeletePromises = existingItems.map(async (item) => {
        try {
          await deleteItem(item.id);
        } catch (error) {
          errors.push(
            `Failed to delete existing item "${item.name}": ${error}`,
          );
        }
      });

      // Delete all existing categories
      const categoryDeletePromises = existingCategories.map(
        async (category) => {
          try {
            await deleteCategory(category.id);
          } catch (error) {
            errors.push(
              `Failed to delete existing category "${category.name}": ${error}`,
            );
          }
        },
      );

      // Wait for all deletions to complete
      await Promise.all([...itemDeletePromises, ...categoryDeletePromises]);
      console.log(
        `Deleted ${existingItems.length} items and ${existingCategories.length} categories`,
      );
    }

    // Create mapping between old category IDs and new category IDs
    const categoryIdMapping = new Map<string, string>();

    // Import categories first (products reference them)
    reportProgress("Importing categories...");
    
    // Process categories sequentially for better progress tracking
    for (let i = 0; i < importData.categories.length; i++) {
      const category = importData.categories[i];
      
      reportProgress("Importing categories...", {
        currentCategory: category.name,
      });

      try {
        const newCategoryId = await createCategory({
          name: category.name,
          description: category.description,
          parentId: category.parentId,
          type: category.type,
          transactionType: category.transactionType,
        });
        // Store mapping from old ID to new ID
        categoryIdMapping.set(category.id, newCategoryId);
        categoriesImported++;
      } catch (error) {
        errors.push(`Failed to import category "${category.name}": ${error}`);
      }
    }

    // Import items with updated category IDs
    reportProgress("Importing items...");
    
    // Process items sequentially for better progress tracking
    for (let i = 0; i < importData.items.length; i++) {
      const item = importData.items[i];
      
      reportProgress("Importing items...", {
        currentItem: item.name,
      });

      try {
        // Map old category ID to new category ID
        const newCategoryId = item.categoryId
          ? categoryIdMapping.get(item.categoryId)
          : undefined;

        // Create the item with all required fields
        const newItemId = await createItem({
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: newCategoryId, // Use the new category ID
          variations: item.variations,
          itemType: item.itemType,
          transactionType: item.transactionType,
        });
        itemsImported++;
      } catch (error) {
        errors.push(`Failed to import item "${item.name}": ${error}`);
      }
    }

    reportProgress("Finalizing import...");

    return {
      success: true,
      message: `Successfully imported ${categoriesImported} categories and ${itemsImported} items.`,
      imported: {
        categories: categoriesImported,
        items: itemsImported,
      },
      errors,
    };
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error}`,
      imported: {
        categories: categoriesImported,
        items: itemsImported,
      },
      errors,
    };
  }
}
