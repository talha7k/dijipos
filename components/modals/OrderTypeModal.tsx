"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OrderType } from '@/lib/types'

interface OrderTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderType: OrderType) => void;
  orderType: OrderType | null;
}

export default function OrderTypeModal({ isOpen, onClose, onSave, orderType }: OrderTypeModalProps) {
  const [formData, setFormData] = useState<Partial<OrderType>>({
    name: '',
  });

  useEffect(() => {
    if (orderType) {
      setFormData(orderType);
    } else {
      setFormData({
        name: '',
      });
    }
  }, [orderType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as OrderType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{orderType ? 'Edit Order Type' : 'Add New Order Type'}</DialogTitle>
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
