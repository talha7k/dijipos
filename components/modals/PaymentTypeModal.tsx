"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PaymentType } from '@/lib/types'

interface PaymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentType: PaymentType) => void;
  paymentType: PaymentType | null;
}

export default function PaymentTypeModal({ isOpen, onClose, onSave, paymentType }: PaymentTypeModalProps) {
  const [formData, setFormData] = useState<PaymentType>({id: 0,
    name: '',
    created_at: new Date(),
  });

  useEffect(() => {
    if (paymentType) {
      setFormData(paymentType);
    } else {
      setFormData({
        id: 0,
        name: '',
        created_at: new Date(),
      });
    }
  }, [paymentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{paymentType ? 'Edit Payment Type' : 'Add New Payment Type'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}