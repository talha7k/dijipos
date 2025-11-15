'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { DialogWithActions } from '@/components/ui/DialogWithActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { toast } from 'sonner';
import { Supplier } from '@/types';
import { Upload, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

interface AddSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierAdded?: () => void;
  editingSupplier?: Supplier | null;
}

export function AddSupplierDialog({ open, onOpenChange, onSupplierAdded, editingSupplier }: AddSupplierDialogProps) {
  const { createSupplier, updateSupplier } = useSuppliers();
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
    if (editingSupplier) {
      setFormData({
        name: editingSupplier.name,
        nameAr: editingSupplier.nameAr || '',
        email: editingSupplier.email,
        phone: editingSupplier.phone || '',
        address: editingSupplier.address || '',
        vatNumber: editingSupplier.vatNumber || '',
        logoUrl: editingSupplier.logoUrl || '',
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
  }, [editingSupplier, open]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setUploadingLogo(true);

    try {
      const storageRef = ref(storage, `suppliers/${Date.now()}_logo`);
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
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await createSupplier(formData);
        toast.success('Supplier added successfully');
      }

      onOpenChange(false);
      onSupplierAdded?.();
    } catch {
      toast.error(`Failed to ${editingSupplier ? 'update' : 'add'} supplier`);
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
        {loading ? (editingSupplier ? 'Updating...' : 'Adding...') : (editingSupplier ? 'Update' : 'Add') + ' Supplier'}
      </Button>
    </>
  );

  return (
    <DialogWithActions
      open={open}
      onOpenChange={handleClose}
      title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      description="Enter supplier information"
      actions={actions}
      maxWidth="max-w-2xl"
      contentClassName="max-h-[70vh]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name (English) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Supplier name in English"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="nameAr">Name (Arabic)</Label>
            <Input
              id="nameAr"
              value={formData.nameAr}
              onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              placeholder="Supplier name in Arabic"
              dir="rtl"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="supplier@example.com"
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
        </div>
        <div className="space-y-4">
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
            <Label>Supplier Logo</Label>
            <div className="flex items-center space-x-4">
              {formData.logoUrl ? (
                <div className="relative">
                  <Image
                    src={formData.logoUrl}
                    alt="Supplier Logo"
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
      </div>
    </DialogWithActions>
  );
}