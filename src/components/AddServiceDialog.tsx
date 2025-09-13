'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Category } from '@/types';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (service: {
    name: string;
    description: string;
    price: number;
    categoryId: string | null;
  }) => void;
  categories: Category[];
  selectedCategory?: string | null;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  categories,
  selectedCategory
}: AddServiceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>(selectedCategory || '');

  // Update categoryId when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setCategoryId(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddService({
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
    const serviceCategories = categories.filter(c => c.type === 'service' || c.type === 'both');
    const filteredCategories = parentId === null
      ? serviceCategories.filter(c => !c.parentId)
      : serviceCategories.filter(c => c.parentId === parentId);

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
          Add Service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceName">Name</Label>
            <Input
              id="serviceName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="serviceDescription">Description</Label>
            <Textarea
              id="serviceDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="servicePrice">Price</Label>
            <Input
              id="servicePrice"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="serviceCategory">Category</Label>
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
            <Button type="submit">Add Service</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}