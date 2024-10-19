import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Supplier } from '@/lib/types'

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by'>) => void;
  supplier: Supplier | null;
}

export default function SupplierModal({ isOpen, onClose, onSave, supplier }: SupplierModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setEmail(supplier.contact?.email || '');
      setPhone(supplier.contact?.phone || '');
      setAddress(supplier.contact?.address || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      contact: {
        email,
        phone,
        address: address || undefined
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Supplier Name"
              required
            />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              required
            />
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address (optional)"
            />
          </div>
          <DialogFooter>
            <Button type="submit">{supplier ? 'Update' : 'Add'} Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
