'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
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

interface EditableTableCellProps {
  value: string;
  type?: 'text' | 'email';
  onSave: (value: string) => void;
  className?: string;
}

function EditableTableCell({ value, type = 'text', onSave, className }: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <TableCell className={`${className} p-0`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          type={type}
          autoFocus
          className="h-8 border-2 border-primary bg-background px-2 py-1 shadow-sm focus-visible:ring-1"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`${className} cursor-pointer hover:bg-accent transition-colors group relative`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center justify-between">
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Double-click to edit"}
        </span>
        <div className="opacity-0 group-hover:opacity-70 transition-opacity text-xs text-muted-foreground">
          ✏️
        </div>
      </div>
    </TableCell>
  );
}

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
}: SupplierInfoProps) {
  const { suppliers } = useSuppliers();

  const handleSupplierSelect = (supplierId: string) => {
    onSupplierSelect(supplierId);
    const supplier = getSupplierById(suppliers, supplierId);
    if (supplier) {
      onSupplierNameChange(supplier.name);
      onSupplierEmailChange(supplier.email);
      onSupplierAddressChange(supplier.address || '');
    }
  };

  return (
    <>
      <div>
        <Label>Select Supplier</Label>
        <Combobox
          options={getSupplierOptions(suppliers)}
          value={selectedSupplierId}
          onValueChange={handleSupplierSelect}
          placeholder="Choose a supplier..."
          searchPlaceholder="Search suppliers..."
          emptyMessage="No suppliers found."
          buttonWidth="w-full"
        />
      </div>

      {selectedSupplierId && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4} className="bg-muted font-semibold">Supplier Information</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium w-1/4">Supplier Name</TableCell>
              <EditableTableCell
                value={supplierName}
                onSave={onSupplierNameChange}
                className="font-medium w-1/4"
              />
              <TableCell className="bg-muted/50 font-medium w-1/4">Supplier Email</TableCell>
              <EditableTableCell
                value={supplierEmail}
                type="email"
                onSave={onSupplierEmailChange}
                className="w-1/4"
              />
            </TableRow>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium">Supplier Address</TableCell>
              <EditableTableCell
                value={supplierAddress}
                onSave={onSupplierAddressChange}
              />
              {showVAT ? (
                <>
                  <TableCell className="bg-muted/50 font-medium">Supplier VAT Number</TableCell>
                  <EditableTableCell
                    value={supplierVAT}
                    onSave={(value) => onSupplierVATChange?.(value)}
                  />
                </>
              ) : (
                <>
                  <TableCell className="border-none"></TableCell>
                  <TableCell className="border-none"></TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
}