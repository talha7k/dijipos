"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Product } from '@/lib/types'
import { useAppStore } from '@/lib/store';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'created_at' | 'created_by'>) => void;
  product: Product | null;
}

export default function ProductModal({ isOpen, onClose, onSave, product }: ProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const { productCategories, fetchProductCategories } = useAppStore();

  useEffect(() => {
    fetchProductCategories();
  }, [fetchProductCategories]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setCategoryId(product.category_id);
      setIsAvailable(product.is_available);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setIsAvailable(true);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      price: parseFloat(price),
      category_id: categoryId,
      is_available: isAvailable,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              required
            />
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              required
              step="0.01"
            />
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={(checked) => setIsAvailable(checked as boolean)}
              />
              <label htmlFor="isAvailable">Available</label>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{product ? 'Update' : 'Add'} Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
