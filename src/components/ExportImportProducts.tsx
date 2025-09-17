'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useExportImport } from '@/legacy_hooks/useExportImport';
import { useAuth } from '@/lib/hooks/useAuth';

interface ExportImportProductsProps {
  organizationId?: string;
}

export function ExportImportProducts({ organizationId }: ExportImportProductsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const { user } = useAuth();
  const {
    exportData,
    downloadSample,
    importFromFile,
    isImporting,
    lastImportResult
  } = useExportImport(organizationId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    await importFromFile(selectedFile, {
      overwriteExisting,
      skipDuplicates
    });
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            Products & Categories Data Management
          </CardTitle>
          <CardDescription>
            Export your products and categories data to JSON format, or import from a JSON file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Export Data</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={exportData}
                disabled={!canExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Current Data
              </Button>
              <Button
                onClick={downloadSample}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download Sample Data
              </Button>
            </div>
            {!canExport && (
              <p className="text-sm text-muted-foreground">
                You need to be logged in and have an organization selected to export data.
              </p>
            )}
          </div>

          {/* Import Section */}
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
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
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
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                    />
                    <span className="text-sm">Skip duplicate entries</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={overwriteExisting}
                      onChange={(e) => setOverwriteExisting(e.target.checked)}
                    />
                    <span className="text-sm">Overwrite existing entries</span>
                  </label>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={!canImport || isImporting}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {isImporting ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
            )}

            {!organizationId && (
              <p className="text-sm text-muted-foreground">
                Please select an organization to import data.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Results */}
      {lastImportResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastImportResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Import Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant={lastImportResult.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{lastImportResult.message}</AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{lastImportResult.imported.categories}</div>
                <div className="text-sm text-muted-foreground">Categories Imported</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{lastImportResult.imported.products}</div>
                <div className="text-sm text-muted-foreground">Products Imported</div>
              </div>
            </div>

            {lastImportResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Errors:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {lastImportResult.errors.map((error, index) => (
                    <li key={index} className="list-disc list-inside">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}