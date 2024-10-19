"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Inventory, Product } from '@/lib/types'
import { Timestamp } from 'firebase/firestore';
import { useAppStore } from '@/lib/store';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inventory: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => void;
  inventory: Inventory | null;
}

export default function InventoryModal({ isOpen, onClose, onSave, inventory }: InventoryModalProps) {
  const [isExistingProduct, setIsExistingProduct] = useState(true);
  const [productId, setProductId] = useState('');
  const [customName, setCustomName] = useState('');
  const [quantityInStock, setQuantityInStock] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState<'grams' | 'ml' | 'pieces'>('pieces');
  const [reorderLevel, setReorderLevel] = useState('');
  const [lastRestockedAt, setLastRestockedAt] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { products, fetchProducts } = useAppStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (inventory) {
      setIsExistingProduct(!!inventory.product);
      if (inventory.product) {
        setProductId(inventory.product.id);
        setCustomName(inventory.product.name_en);
      } else {
        setCustomName(inventory.name);
      }
      setQuantityInStock(inventory.quantity_in_stock.toString());
      setUnitOfMeasure(inventory.unit_of_measure || 'pieces');
      setReorderLevel(inventory.reorder_level?.toString() || '');
      setLastRestockedAt(inventory.last_restocked_at instanceof Timestamp ? inventory.last_restocked_at.toDate().toISOString().split('T')[0] : '');
      setExpiryDate(inventory.expiry_date instanceof Timestamp ? inventory.expiry_date.toDate().toISOString().split('T')[0] : '');
    } else {
      setIsExistingProduct(true);
      setProductId('');
      setCustomName('');
      setQuantityInStock('');
      setUnitOfMeasure('pieces');
      setReorderLevel('');
      setLastRestockedAt('');
      setExpiryDate('');
    }
  }, [inventory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProduct = isExistingProduct ? products.find(p => p.id === productId) : undefined;
    onSave({
      product: selectedProduct,
      name: selectedProduct ? selectedProduct.name_en : customName,
      quantity_in_stock: parseInt(quantityInStock),
      unit_of_measure: unitOfMeasure,
      reorder_level: parseInt(reorderLevel) || undefined,
      last_restocked_at: lastRestockedAt ? Timestamp.fromDate(new Date(lastRestockedAt)) : undefined,
      expiry_date: expiryDate ? Timestamp.fromDate(new Date(expiryDate)) : 'non-perishable',
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isExistingProduct"
                checked={isExistingProduct}
                onCheckedChange={(checked) => setIsExistingProduct(checked as boolean)}
              />
              <label htmlFor="isExistingProduct">Existing Product</label>
            </div>
            {isExistingProduct ? (
              <Select value={productId} onValueChange={(value) => {
                setProductId(value);
                const selectedProduct = products.find(p => p.id === value);
                if (selectedProduct) {
                  setCustomName(selectedProduct.name_en);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>{product.name_en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Custom Item Name"
                required
              />
            )}
            <Input
              type="number"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(e.target.value)}
              placeholder="Quantity in Stock"
              required
            />
            <Select value={unitOfMeasure} onValueChange={(value: 'grams' | 'ml' | 'pieces') => setUnitOfMeasure(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Unit of Measure" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grams">Grams</SelectItem>
                <SelectItem value="ml">Milliliters</SelectItem>
                <SelectItem value="pieces">Pieces</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              placeholder="Reorder Level"
            />
            <Input
              type="date"
              value={lastRestockedAt}
              onChange={(e) => setLastRestockedAt(e.target.value)}
              placeholder="Last Restocked At"
            />
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              placeholder="Expiry Date"
            />
          </div>
          <DialogFooter>
            <Button type="submit">{inventory ? 'Update' : 'Add'} Inventory Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
