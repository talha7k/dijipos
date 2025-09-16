'use client';

import { useCallback, useState } from 'react';
import { Category, Product } from '@/types';
import {
  exportProductsAndCategories,
  downloadSampleData,
  parseImportFile,
  importProductsAndCategories,
  ImportData,
  ImportOptions,
  ImportResult
} from '@/lib/export-import-utils';
import { useCategoriesData } from './products_services/useCategories';
import { useProductsData, useProductActions } from './products_services/useProducts';

export interface UseExportImportResult {
  // Export functions
  exportData: () => void;
  downloadSample: () => void;

  // Import functions
  importFromFile: (file: File, options?: ImportOptions) => Promise<ImportResult>;

  // State
  isImporting: boolean;
  lastImportResult: ImportResult | null;
}

export function useExportImport(organizationId: string | undefined): UseExportImportResult {
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);

  const { categories, loading: categoriesLoading } = useCategoriesData(organizationId);
  const { products, loading: productsLoading } = useProductsData(organizationId);

  // Get the mutation functions from the existing hooks
  const categoriesHook = useCategoriesData(organizationId);
  const productsHook = useProductActions(organizationId);

  const exportData = useCallback(() => {
    if (!organizationId || categoriesLoading || productsLoading) {
      console.warn('Cannot export: missing organization ID or data still loading');
      return;
    }

    exportProductsAndCategories(organizationId, categories, products);
  }, [organizationId, categories, products, categoriesLoading, productsLoading]);

  const downloadSample = useCallback(() => {
    downloadSampleData();
  }, []);

  const importFromFile = useCallback(async (
    file: File,
    options: ImportOptions = { overwriteExisting: false, skipDuplicates: true }
  ): Promise<ImportResult> => {
    if (!organizationId) {
      const result: ImportResult = {
        success: false,
        message: 'No organization selected',
        imported: { categories: 0, products: 0 },
        errors: ['No organization selected']
      };
      setLastImportResult(result);
      return result;
    }

    setIsImporting(true);

    try {
      // Parse the file
      const importData: ImportData = await parseImportFile(file);

      // Import the data
      const result = await importProductsAndCategories(
        organizationId,
        importData,
        categoriesHook.createCategory,
        async (data) => {
          await productsHook.createProduct(data);
        },
        options
      );

      setLastImportResult(result);
      return result;

    } catch (error) {
      const result: ImportResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Import failed',
        imported: { categories: 0, products: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
      setLastImportResult(result);
      return result;
    } finally {
      setIsImporting(false);
    }
  }, [organizationId, categoriesHook.createCategory, productsHook.createProduct]);

  return {
    exportData,
    downloadSample,
    importFromFile,
    isImporting,
    lastImportResult
  };
}