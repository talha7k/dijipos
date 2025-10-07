'use client';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Supplier } from '@/types';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { Plus, Edit, X } from 'lucide-react';

// Utility functions for real supplier data
const getSupplierOptions = (suppliers: Supplier[]) => {
  return suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name,
    description: supplier.email,
  }));
};

const getSupplierById = (suppliers: Supplier[], id: string) => {
  return suppliers.find((supplier) => supplier.id === id);
};

interface SupplierInfoProps {
  selectedSupplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  supplierVAT?: string;
  showVAT?: boolean;
  onSupplierSelect: (supplierId: string) => void;
  onSupplierNameChange: (name: string) => void;
  onSupplierEmailChange: (email: string) => void;
  onSupplierAddressChange: (address: string) => void;
  onSupplierVATChange?: (vat: string) => void;
  onAddSupplier?: () => void;
  readOnly?: boolean;
  onEditSupplier?: () => void;
  showAddButtonInReadOnly?: boolean;
  onClearSupplier?: () => void;
}

export default function SupplierInfo({
  selectedSupplierId,
  supplierName,
  supplierEmail,
  supplierAddress,
  supplierVAT = '',
  showVAT = false,
  onSupplierSelect,
  onSupplierNameChange,
  onSupplierEmailChange,
  onSupplierAddressChange,
  onSupplierVATChange,
  onAddSupplier,
  readOnly = false,
  onEditSupplier,
  showAddButtonInReadOnly = false,
  onClearSupplier,
}: SupplierInfoProps) {
  const { suppliers } = useSuppliers();

  const handleSupplierSelect = (supplierId: string) => {
    onSupplierSelect(supplierId);
    const supplier = getSupplierById(suppliers, supplierId);
    if (supplier) {
      onSupplierNameChange(supplier.name);
      onSupplierEmailChange(supplier.email);
      onSupplierAddressChange(supplier.address || '');
      onSupplierVATChange?.(supplier.vatNumber || '');
    }
  };

  return (
    <>
      {!readOnly && (
        <div>
          <Label>Select Supplier</Label>
          <div className="flex gap-2">
            <Combobox
              options={getSupplierOptions(suppliers)}
              value={selectedSupplierId}
              onValueChange={handleSupplierSelect}
              placeholder="Choose a supplier..."
              searchPlaceholder="Search suppliers..."
              emptyMessage="No suppliers found."
              buttonWidth="flex-1"
            />
            {(!readOnly || showAddButtonInReadOnly) && onAddSupplier && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onAddSupplier}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {(selectedSupplierId || readOnly) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4} className="bg-muted font-semibold">
                <div className="flex items-center justify-between">
                  <span>Supplier Information</span>
                  <div className="flex items-center gap-2">
                    {onClearSupplier && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onClearSupplier}
                        className="shrink-0"
                        title="Clear supplier"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {readOnly && onEditSupplier && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onEditSupplier}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium w-1/4">Supplier Name</TableCell>
              <TableCell className="w-1/4">{supplierName}</TableCell>
              <TableCell className="bg-muted/50 font-medium w-1/4">Supplier Email</TableCell>
              <TableCell className="w-1/4">{supplierEmail}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium">Supplier Address</TableCell>
              <TableCell colSpan={showVAT ? 1 : 3}>{supplierAddress}</TableCell>
              {showVAT && (
                <>
                  <TableCell className="bg-muted/50 font-medium">Supplier VAT Number</TableCell>
                  <TableCell>{supplierVAT}</TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </Table>
      )}


    </>
  );
}