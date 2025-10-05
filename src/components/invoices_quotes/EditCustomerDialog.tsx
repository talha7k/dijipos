'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { SalesInvoice, PurchaseInvoice, Customer, Supplier, InvoiceType } from '@/types';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useSuppliers } from '@/lib/hooks/useSuppliers';

interface EditCustomerDialogProps {
  invoice: SalesInvoice | PurchaseInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedInvoice: SalesInvoice | PurchaseInvoice) => void;
}

export function EditCustomerDialog({
  invoice,
  open,
  onOpenChange,
  onUpdate,
}: EditCustomerDialogProps) {
  const { customers, updateCustomer } = useCustomers();
  const { suppliers, updateSupplier } = useSuppliers();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  const [supplierName, setSupplierName] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierVAT, setSupplierVAT] = useState('');

  useEffect(() => {
    if (invoice && open) {
      if (invoice.type === InvoiceType.SALES) {
        const salesInvoice = invoice as SalesInvoice;
        setClientName(salesInvoice.clientName || '');
        setClientEmail(salesInvoice.clientEmail || '');
        setClientAddress(salesInvoice.clientAddress || '');
      } else {
        const purchaseInvoice = invoice as PurchaseInvoice;
        setSupplierName(purchaseInvoice.supplierName || '');
        setSupplierEmail(purchaseInvoice.supplierEmail || '');
        setSupplierAddress(purchaseInvoice.supplierAddress || '');
        setSupplierVAT(purchaseInvoice.supplierVAT || '');
      }
    }
  }, [invoice, open]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      if (invoice.type === InvoiceType.SALES) {
        // Update customer info in invoice
        const updatedInvoice: SalesInvoice = {
          ...invoice,
          clientName,
          clientEmail,
          clientAddress,
        };
        onUpdate(updatedInvoice);
      } else {
        // Update supplier info in invoice
        const updatedInvoice: PurchaseInvoice = {
          ...invoice,
          supplierName,
          supplierEmail,
          supplierAddress,
          supplierVAT,
        };
        onUpdate(updatedInvoice);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating customer/supplier info:', error);
    }
  };

  if (!invoice) return null;

  const isSales = invoice.type === InvoiceType.SALES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Edit {isSales ? 'Customer' : 'Supplier'} Information
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isSales ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientName" className="text-right">
                  Name
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientAddress" className="text-right">
                  Address
                </Label>
                <Input
                  id="clientAddress"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierName" className="text-right">
                  Name
                </Label>
                <Input
                  id="supplierName"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierEmail" className="text-right">
                  Email
                </Label>
                <Input
                  id="supplierEmail"
                  type="email"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierAddress" className="text-right">
                  Address
                </Label>
                <Input
                  id="supplierAddress"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="supplierVAT" className="text-right">
                  VAT
                </Label>
                <Input
                  id="supplierVAT"
                  value={supplierVAT}
                  onChange={(e) => setSupplierVAT(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </>
          )}
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