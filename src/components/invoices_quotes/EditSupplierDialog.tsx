'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { PurchaseInvoice } from '@/types';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';

interface EditSupplierDialogProps {
  invoice: PurchaseInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedInvoice: PurchaseInvoice) => void;
  onChildDialogChange?: (isOpen: boolean) => void;
}

export function EditSupplierDialog({
  invoice,
  open,
  onOpenChange,
  onUpdate,
  onChildDialogChange,
}: EditSupplierDialogProps) {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { suppliers, updateSupplier } = useSuppliers();

  // Supplier fields
  const [supplierName, setSupplierName] = useState('');
  const [supplierNameAr, setSupplierNameAr] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierVAT, setSupplierVAT] = useState('');
  const [supplierContactPerson, setSupplierContactPerson] = useState('');
  const [supplierLogoUrl, setSupplierLogoUrl] = useState('');

  useEffect(() => {
    if (open) {
      onChildDialogChange?.(true);
    }
  }, [open, onChildDialogChange]);

  useEffect(() => {
    if (invoice && open) {
      // Reset fields first to ensure clean state
      setSupplierName('');
      setSupplierNameAr('');
      setSupplierEmail('');
      setSupplierAddress('');
      setSupplierPhone('');
      setSupplierVAT('');
      setSupplierContactPerson('');
      setSupplierLogoUrl('');

      // Find the supplier record
      const supplier = suppliers.find(s => s.name === invoice.supplierName);
      if (supplier) {
        setSupplierName(supplier.name || '');
        setSupplierNameAr(supplier.nameAr || '');
        setSupplierEmail(supplier.email || '');
        setSupplierAddress(supplier.address || '');
        setSupplierPhone(supplier.phone || '');
        setSupplierVAT(supplier.vatNumber || '');
        setSupplierContactPerson(supplier.contactPerson || '');
        setSupplierLogoUrl(supplier.logoUrl || '');
      } else {
        // Fallback to invoice data if supplier not found
        setSupplierName(invoice.supplierName || '');
        setSupplierEmail(invoice.supplierEmail || '');
        setSupplierAddress(invoice.supplierAddress || '');
        setSupplierVAT(invoice.supplierVAT || '');
        setSupplierNameAr('');
        setSupplierPhone('');
        setSupplierContactPerson('');
        setSupplierLogoUrl('');
      }
    }
  }, [invoice, open, suppliers]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      // Find and update the supplier record
      const supplier = suppliers.find(s => s.id === invoice.supplierId);
      if (supplier) {
        await updateSupplier(supplier.id, {
          name: supplierName,
          nameAr: supplierNameAr,
          email: supplierEmail,
          address: supplierAddress,
          phone: supplierPhone,
          vatNumber: supplierVAT,
          contactPerson: supplierContactPerson,
          logoUrl: supplierLogoUrl,
        });
      }

      // Update supplier info in invoice
      const updatedInvoice: PurchaseInvoice = {
        ...invoice,
        supplierName,
        supplierEmail,
        supplierAddress,
        supplierVAT,
      };
      onUpdate(updatedInvoice);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating supplier info:', error);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        onChildDialogChange?.(false);
      }
      onOpenChange(open);
    }}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            Edit Supplier Information
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierName">Name</Label>
              <Input
                id="supplierName"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierNameAr">Arabic Name</Label>
              <Input
                id="supplierNameAr"
                value={supplierNameAr}
                onChange={(e) => setSupplierNameAr(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierEmail">Email</Label>
              <Input
                id="supplierEmail"
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierPhone">Phone</Label>
              <Input
                id="supplierPhone"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierVAT">VAT Number</Label>
              <Input
                id="supplierVAT"
                value={supplierVAT}
                onChange={(e) => setSupplierVAT(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierContactPerson">Contact Person</Label>
              <Input
                id="supplierContactPerson"
                value={supplierContactPerson}
                onChange={(e) => setSupplierContactPerson(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplierAddress">Address</Label>
              <Textarea
                id="supplierAddress"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier Logo</Label>
              <ImageUpload
                value={supplierLogoUrl}
                onChange={(url) => setSupplierLogoUrl(url || '')}
                path={`organizations/${organizationId}/suppliers`}
                placeholder="Upload supplier logo"
                maxSize={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}