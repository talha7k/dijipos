"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PurchaseOrder, Supplier } from '@/lib/types'
import { useAppStore } from '@/lib/store';
import { Timestamp } from 'firebase/firestore';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (purchaseOrder: Omit<PurchaseOrder, 'id' | 'created_at'>) => void;
  purchaseOrder: PurchaseOrder | null;
}

export default function PurchaseOrderModal({ isOpen, onClose, onSave, purchaseOrder }: PurchaseOrderModalProps) {
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('pending');
  const [totalAmount, setTotalAmount] = useState('');

  const { suppliers, fetchSuppliers, currentUser } = useAppStore();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  useEffect(() => {
    if (purchaseOrder) {
      setSupplierId(purchaseOrder.supplier_id);
      setStatus(purchaseOrder.status);
      setTotalAmount(purchaseOrder.total_amount.toString());
    } else {
      setSupplierId('');
      setStatus('pending');
      setTotalAmount('');
    }
  }, [purchaseOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
    onSave({
      supplier_id: supplierId,
      status,
      total_amount: parseFloat(totalAmount),
      business_id: currentUser.business_id,
      created_by: currentUser,
      received_at: status === 'completed' ? Timestamp.now() : null,
    });
  };

  if (!currentUser) {
    return null; // or return some message that user needs to be logged in
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? 'Edit Purchase Order' : 'Add New Purchase Order'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value: 'pending' | 'completed' | 'cancelled') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Total Amount"
              required
              step="0.01"
            />
          </div>
          <DialogFooter>
            <Button type="submit">{purchaseOrder ? 'Update' : 'Add'} Purchase Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
