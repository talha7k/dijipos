'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
import { SalesInvoice, PurchaseInvoice, Customer, Supplier, InvoiceType } from '@/types';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { ImageUpload } from '@/components/ui/image-upload';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';

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
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { customers, updateCustomer } = useCustomers();
  const { suppliers, updateSupplier } = useSuppliers();

  // Customer fields
  const [clientName, setClientName] = useState('');
  const [clientNameAr, setClientNameAr] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientVAT, setClientVAT] = useState('');
  const [clientLogoUrl, setClientLogoUrl] = useState('');

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
    if (invoice && open) {
      if (invoice.type === InvoiceType.SALES) {
        // Find the customer record
        const customer = customers.find(c => c.name === (invoice as SalesInvoice).clientName);
        if (customer) {
          setClientName(customer.name || '');
          setClientNameAr(customer.nameAr || '');
          setClientEmail(customer.email || '');
          setClientAddress(customer.address || '');
          setClientPhone(customer.phone || '');
          setClientVAT(customer.vatNumber || '');
          setClientLogoUrl(customer.logoUrl || '');
        } else {
          // Fallback to invoice data if customer not found
          const salesInvoice = invoice as SalesInvoice;
          setClientName(salesInvoice.clientName || '');
          setClientEmail(salesInvoice.clientEmail || '');
          setClientAddress(salesInvoice.clientAddress || '');
          setClientNameAr('');
          setClientPhone('');
          setClientVAT('');
          setClientLogoUrl('');
        }
      } else {
        // Find the supplier record
        const purchaseInvoice = invoice as PurchaseInvoice;
        const supplier = suppliers.find(s => s.id === purchaseInvoice.supplierId);
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
          setSupplierName(purchaseInvoice.supplierName || '');
          setSupplierEmail(purchaseInvoice.supplierEmail || '');
          setSupplierAddress(purchaseInvoice.supplierAddress || '');
          setSupplierVAT(purchaseInvoice.supplierVAT || '');
          setSupplierNameAr('');
          setSupplierPhone('');
          setSupplierContactPerson('');
          setSupplierLogoUrl('');
        }
      }
    }
  }, [invoice, open, customers, suppliers]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      if (invoice.type === InvoiceType.SALES) {
        // Find and update the customer record
        const customer = customers.find(c => c.name === (invoice as SalesInvoice).clientName);
        if (customer) {
          await updateCustomer(customer.id, {
            name: clientName,
            nameAr: clientNameAr,
            email: clientEmail,
            address: clientAddress,
            phone: clientPhone,
            vatNumber: clientVAT,
            logoUrl: clientLogoUrl,
          });
        }

        // Update customer info in invoice
        const updatedInvoice: SalesInvoice = {
          ...invoice,
          clientName,
          clientEmail,
          clientAddress,
        };
        onUpdate(updatedInvoice);
      } else {
        // Find and update the supplier record
        const purchaseInvoice = invoice as PurchaseInvoice;
        const supplier = suppliers.find(s => s.id === purchaseInvoice.supplierId);
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit {isSales ? 'Customer' : 'Supplier'} Information
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4 max-h-96 overflow-y-auto">
          {isSales ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Name</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientNameAr">Arabic Name</Label>
                  <Input
                    id="clientNameAr"
                    value={clientNameAr}
                    onChange={(e) => setClientNameAr(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientVAT">VAT Number</Label>
                  <Input
                    id="clientVAT"
                    value={clientVAT}
                    onChange={(e) => setClientVAT(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Logo</Label>
                  <ImageUpload
                    value={clientLogoUrl}
                    onChange={(url) => setClientLogoUrl(url || '')}
                    path={`organizations/${organizationId}/customers`}
                    placeholder="Upload client logo"
                    maxSize={2}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
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