"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Inventory } from '@/lib/types'
import { useAppStore } from '@/lib/store';
import { Timestamp } from '@firebase/firestore';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inventory: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => void;
  inventory: Inventory | null;
}

export default function InventoryModal({ isOpen, onClose, onSave, inventory }: InventoryModalProps) {
  const [productId, setProductId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [lastRestockedAt, setLastRestockedAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isPerishable, setIsPerishable] = useState(true);

  const { products, fetchProducts, currentUser } = useAppStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (inventory) {
      setProductId(inventory.product_id);
      setName(inventory.name);
      setQuantity(inventory.quantity.toString());
      setLastRestockedAt(inventory.last_restocked_at.toDate().toISOString().split('T')[0]);
      if (inventory.expiry_date !== 'non-perishable') {
        setExpiryDate(inventory.expiry_date.toDate().toISOString().split('T')[0]);
        setIsPerishable(true);
      } else {
        setExpiryDate('');
        setIsPerishable(false);
      }
    } else {
      setProductId(undefined);
      setName('');
      setQuantity('');
      setLastRestockedAt('');
      setExpiryDate('');
      setIsPerishable(true);
    }
  }, [inventory]);

  const handleProductChange = (value: string) => {
    if (value === '') {
      setProductId(undefined);
      setName('');
    } else {
      setProductId(value);
      const selectedProduct = products.find(p => p.id === value);
      setName(selectedProduct ? selectedProduct.name : '');
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value !== '') {
      setProductId(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
    onSave({
      product_id: productId,
      name: name,
      quantity: parseInt(quantity),
      business_id: currentUser.business_id,
      last_restocked_at: Timestamp.fromDate(new Date(lastRestockedAt)),
      expiry_date: isPerishable ? Timestamp.fromDate(new Date(expiryDate)) : 'non-perishable',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{inventory ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Select value={productId || ''} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom Item</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Item Name"
              required
            />
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              required
            />
            <Input
              id="lastRestockedAt"
              type="date"
              value={lastRestockedAt}
              onChange={(e) => setLastRestockedAt(e.target.value)}
              placeholder="Last Restocked At"
              required
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPerishable"
                checked={isPerishable}
                onChange={(e) => setIsPerishable(e.target.checked)}
              />
              <label htmlFor="isPerishable">Is Perishable</label>
            </div>
            {isPerishable && (
              <Input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="Expiry Date"
                required={isPerishable}
              />
            )}
          </div>
          <DialogFooter>
            <Button type="submit">{inventory ? 'Update' : 'Add'} Inventory Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
