'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomers } from '@/lib/hooks/useCustomers';
import { toast } from 'sonner';

interface QuickAddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded?: () => void;
}

export function QuickAddCustomerDialog({ open, onOpenChange, onCustomerAdded }: QuickAddCustomerDialogProps) {
  const { createCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    phone: '',
    address: '',
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setLoading(true);
    try {
      await createCustomer({
        name: formData.name.trim(),
        nameAr: formData.nameAr.trim(),
        email: '', // Empty email for quick add
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        vatNumber: '',
        logoUrl: '',
      });

      toast.success('Customer added successfully');
      onOpenChange(false);
      setFormData({ name: '', nameAr: '', phone: '', address: '' });
      onCustomerAdded?.();
    } catch (error) {
      toast.error('Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setFormData({ name: '', nameAr: '', phone: '', address: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Add Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name (English) *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Customer name"
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Adding...' : 'Add Customer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}