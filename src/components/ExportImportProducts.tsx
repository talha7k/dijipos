"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Download, Upload, FileText } from "lucide-react";
import {
  downloadSampleData,
  exportProductsAndCategories,
  parseImportFile,
  importProductsAndCategories,
  ImportResult,
  ImportProgress,
} from "@/lib/export-import-utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { Category, Item } from "@/types";
import { ImportResultDialog } from "./ImportResultDialog";

interface ExportImportProductsProps {
  organizationId?: string;
  categories?: Category[];
  items?: Item[];
  onCreateCategory?: (
    data: Omit<Category, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  onCreateItem?: (
    data: Omit<Item, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onDeleteItem?: (itemId: string) => Promise<void>;
}

export function ExportImportProducts({
  organizationId,
  categories = [],
  items = [],
  onCreateCategory,
  onCreateItem,
  onDeleteCategory,
  onDeleteItem,
}: ExportImportProductsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwriteExistingData, setOverwriteExistingData] = useState(false);
  const [overwriteDuplicates, setOverwriteDuplicates] = useState(false);

  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(
    null,
  );
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Export function
  const handleExport = () => {
    if (!organizationId) return;
    exportProductsAndCategories(organizationId, categories, items);
  };

  // Download sample data
  const handleDownloadSample = () => {
    downloadSampleData();
  };

  // Import from file
  const handleImport = async () => {
    if (!selectedFile || !organizationId || !onCreateCategory || !onCreateItem)
      return;

    setIsImporting(true);
    setImportProgress(null);
    setLastImportResult(null);

    try {
      const importData = await parseImportFile(selectedFile);
      const result = await importProductsAndCategories(
        organizationId,
        importData,
        onCreateCategory || (() => Promise.resolve("")),
        onCreateItem || (() => Promise.resolve("")),
        onDeleteCategory || (() => Promise.resolve()),
        onDeleteItem || (() => Promise.resolve()),
        categories,
        items,
        {
          overwriteExisting: overwriteExistingData,
          skipDuplicates: !overwriteDuplicates,
          overwriteDuplicates,
        },
        (progress) => setImportProgress(progress),
      );
      setLastImportResult(result);
      if (result.success) {
        setShowResultDialog(true);
      }
    } catch (error) {
      setLastImportResult({
        success: false,
        message: `Import failed: ${error}`,
        imported: { categories: 0, items: 0 },
        errors: [error as string],
      });
    } finally {
      setIsImporting(false);
      // Keep progress visible so user can see the final state
      // Progress will be cleared when user starts a new import or clears file
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportProgress(null);
      setLastImportResult(null);
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setImportProgress(null);
    setLastImportResult(null);
    setShowResultDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canExport = organizationId && user;
  const canImport = organizationId && user && selectedFile;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Products, Services & Categories Data Management
          </CardTitle>
          <CardDescription>
            Export your products, services and categories data to JSON format,
            or import from a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Export Current Data</h3>
                <Button
                  onClick={handleExport}
                  disabled={!canExport}
                  variant="outline"
                  className="flex items-center gap-2 w-full"
                >
                  <Download className="w-4 h-4" />
                  Export Current Data
                </Button>
                {!canExport && (
                  <p className="text-sm text-muted-foreground">
                    You need to be logged in and have an organization selected
                    to export data.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Download Sample Data</h3>
              <Button
                onClick={handleDownloadSample}
                variant="outline"
                className="flex items-center gap-2 w-full"
              >
                <FileText className="w-4 h-4" />
                Download Sample Data
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium">Import Data</h3>

              {/* File Selection */}
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    disabled={!organizationId || !user}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Select JSON File
                  </Button>
                  {selectedFile && (
                    <Button
                      onClick={clearFileSelection}
                      variant="ghost"
                      size="sm"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              {/* Import Options */}
              {selectedFile && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={overwriteExistingData}
                        onChange={(e) =>
                          setOverwriteExistingData(e.target.checked)
                        }
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-red-600 font-medium">
                        Overwrite existing data
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={overwriteDuplicates}
                        onChange={(e) =>
                          setOverwriteDuplicates(e.target.checked)
                        }
                      />
                      <span className="text-sm">
                        Overwrite duplicate entries (by name)
                      </span>
                    </label>
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={!canImport || isImporting}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {isImporting ? "Importing..." : "Import Data"}
                  </Button>
                </div>
              )}

              {/* Import Progress */}
              {importProgress && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{importProgress.currentStep}</span>
                        <span>
                          {importProgress.categoriesProcessed +
                            importProgress.itemsProcessed}{" "}
                          /{" "}
                          {importProgress.totalCategories +
                            importProgress.totalItems}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((importProgress.categoriesProcessed +
                            importProgress.itemsProcessed) /
                            (importProgress.totalCategories +
                              importProgress.totalItems)) *
                          100
                        }
                        className="w-full"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Categories</div>
                        <div className="text-muted-foreground">
                          {importProgress.categoriesProcessed} /{" "}
                          {importProgress.totalCategories}
                        </div>
                        {importProgress.currentCategory && (
                          <div className="text-xs text-muted-foreground truncate">
                            Current: {importProgress.currentCategory}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">Items</div>
                        <div className="text-muted-foreground">
                          {importProgress.itemsProcessed} /{" "}
                          {importProgress.totalItems}
                        </div>
                        {importProgress.currentItem && (
                          <div className="text-xs text-muted-foreground truncate">
                            Current: {importProgress.currentItem}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            </div>
          </div>

          {!organizationId && (
            <p className="text-sm text-muted-foreground">
              Please select an organization to import data.
            </p>
          )}
        </CardContent>
      </Card>

      <ImportResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        result={lastImportResult}
      />
    </div>
  );
}
