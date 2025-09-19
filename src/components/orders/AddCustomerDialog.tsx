'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DialogWithActions } from '@/components/ui/DialogWithActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { toast } from 'sonner';
import { Customer } from '@/types';
import { Upload, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: () => void;
  editingCustomer?: Customer | null;
}

export function AddCustomerDialog({ open, onOpenChange, onCustomerAdded, editingCustomer }: AddCustomerDialogProps) {
  const { createCustomer, updateCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        name: editingCustomer.name,
        nameAr: editingCustomer.nameAr || '',
        email: editingCustomer.email,
        phone: editingCustomer.phone || '',
        address: editingCustomer.address || '',
        vatNumber: editingCustomer.vatNumber || '',
        logoUrl: editingCustomer.logoUrl || '',
      });
    } else {
      setFormData({
        name: '',
        nameAr: '',
        email: '',
        phone: '',
        address: '',
        vatNumber: '',
        logoUrl: '',
      });
    }
  }, [editingCustomer, open]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setUploadingLogo(true);

    try {
      const storageRef = ref(storage, `customers/${Date.now()}_logo`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      setFormData(prev => ({ ...prev, logoUrl: downloadUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setLoading(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
        toast.success('Customer updated successfully');
      } else {
        await createCustomer(formData);
        toast.success('Customer added successfully');
      }

      onOpenChange(false);
      onCustomerAdded?.();
    } catch (error) {
      toast.error(`Failed to ${editingCustomer ? 'update' : 'add'} customer`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  const actions = (
    <>
      <Button variant="outline" onClick={handleClose} disabled={loading}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={loading}>
        {loading ? (editingCustomer ? 'Updating...' : 'Adding...') : (editingCustomer ? 'Update' : 'Add') + ' Customer'}
      </Button>
    </>
  );

  return (
    <DialogWithActions
      open={open}
      onOpenChange={handleClose}
      title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
      description="Enter customer information"
      actions={actions}
      maxWidth="max-w-2xl"
      contentClassName="max-h-[70vh]"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name (English) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name in English"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="nameAr">Name (Arabic)</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="Customer name in Arabic"
              dir="rtl"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="customer@example.com"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-234-567-8900"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address, city, country"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="vatNumber">VAT Number</Label>
          <Input
            id="vatNumber"
            value={formData.vatNumber}
            onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
            placeholder="VAT number"
            disabled={loading}
          />
        </div>
        <div className="space-y-4">
          <Label>Customer Logo</Label>
          <div className="flex items-center space-x-4">
            {formData.logoUrl ? (
              <div className="relative">
                <Image
                  src={formData.logoUrl}
                  alt="Customer Logo"
                  width={96}
                  height={96}
                  className="w-24 h-24 object-contain border rounded"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveLogo}
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Logo</span>
              </div>
            )}
            <div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" loading={uploadingLogo} disabled={loading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
              </Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={loading || uploadingLogo}
              />
              <p className="text-sm text-gray-500 mt-2">
                Recommended: Square image, max 2MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogWithActions>
  );
}