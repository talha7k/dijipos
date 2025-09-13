'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderPlus } from 'lucide-react';
import { Category } from '@/types';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: {
    name: string;
    description: string;
    type: 'product' | 'service' | 'both';
    parentId: string | null;
  }) => void;
  categories: Category[];
  defaultType?: 'product' | 'service' | 'both';
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
  categories,
  defaultType = 'product'
}: AddCategoryDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'product' | 'service' | 'both'>(defaultType);
  const [parentId, setParentId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddCategory({
      name,
      description,
      type,
      parentId: parentId || null
    });

    // Reset form
    setName('');
    setDescription('');
    setType(defaultType);
    setParentId('');
    onOpenChange(false);
  };

  const availableParentCategories = categories.filter(c => 
    !c.parentId && 
    (c.type === type || c.type === 'both')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <FolderPlus className="mr-1 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="categoryName">Name</Label>
            <Input
              id="categoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              required
            />
          </div>
          <div>
            <Label htmlFor="categoryDescription">Description</Label>
            <Textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Category description"
            />
          </div>
          <div>
            <Label htmlFor="categoryType">Type</Label>
            <Select value={type} onValueChange={(value: 'product' | 'service' | 'both') => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="both">Both Products and Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="categoryParentId">Parent Category (Optional)</Label>
            <Select value={parentId || "none"} onValueChange={(value) => setParentId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top Level)</SelectItem>
                {availableParentCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}