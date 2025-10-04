'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ImportResult } from '@/lib/export-import-utils';

interface ImportResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ImportResult | null;
}

export function ImportResultDialog({ open, onOpenChange, result }: ImportResultDialogProps) {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            Import Result
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Alert variant={result.success ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded">
              <div className="text-2xl font-bold">{result.imported.categories}</div>
              <div className="text-sm text-muted-foreground">Categories Imported</div>
            </div>
            <div className="text-center p-3 bg-muted rounded">
              <div className="text-2xl font-bold">{result.imported.items}</div>
              <div className="text-sm text-muted-foreground">Items Imported</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Errors:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <li key={index} className="list-disc list-inside">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}