'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Category } from '@/types';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: {
    name: string;
    description: string;
    price: number;
    categoryId: string | null;
  }) => void;
  categories: Category[];
}

export function AddProductDialog({
  open,
  onOpenChange,
  onAddProduct,
  categories
}: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddProduct({
      name,
      description,
      price: parseFloat(price),
      categoryId: categoryId || null
    });

    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    onOpenChange(false);
  };

  const renderCategoryOptions = (parentId: string | null = null, level = 0) => {
    const productCategories = categories.filter(c => c.type === 'product' || c.type === 'both');
    const filteredCategories = parentId === null
      ? productCategories.filter(c => !c.parentId)
      : productCategories.filter(c => c.parentId === parentId);

    return filteredCategories.map(category => (
      <div key={category.id}>
        <SelectItem value={category.id}>
          {"\u00A0".repeat(level * 2)}{level > 0 ? "└ " : ""}{category.name}
        </SelectItem>
        {renderCategoryOptions(category.id, level + 1)}
      </div>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productName">Name</Label>
            <Input
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="productDescription">Description</Label>
            <Textarea
              id="productDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="productPrice">Price</Label>
            <Input
              id="productPrice"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="productCategory">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {renderCategoryOptions()}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Product</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}