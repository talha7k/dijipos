'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Service, Category, CategoryType, ProductTransactionType, ItemType } from '@/types';
import { useAtomValue } from 'jotai';
import { vatSettingsAtom } from '@/atoms/posAtoms';
import { getVATIndicationText } from '@/lib/vat-calculator';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (service: Omit<Service, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateService: (serviceId: string, service: Partial<Omit<Service, 'id' | 'createdAt'>>) => void;
  serviceToEdit: Service | null;
  categories: Category[];
  selectedCategory?: string | null;
  defaultTransactionType?: ProductTransactionType;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  onUpdateService,
  serviceToEdit,
  categories,
  selectedCategory,
  defaultTransactionType = ProductTransactionType.SALES
}: AddServiceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<ProductTransactionType>(defaultTransactionType);
  const vatSettings = useAtomValue(vatSettingsAtom);

  const isEditMode = serviceToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description || '');
      setPrice(serviceToEdit.price.toString());
      setCategoryId(serviceToEdit.categoryId || '');
      setTransactionType(serviceToEdit.transactionType);
    } else {
      // Reset form for adding new service
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(selectedCategory || '');
      setTransactionType(defaultTransactionType);
    }
  }, [serviceToEdit, isEditMode, selectedCategory, defaultTransactionType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name,
      description,
      price: parseFloat(price),
      categoryId: categoryId || undefined,
      itemType: ItemType.SERVICE as const,
      transactionType
    };

    if (isEditMode) {
      onUpdateService(serviceToEdit.id, serviceData);
    } else {
      onAddService(serviceData);
    }
  };

  const renderCategoryOptions = (parentId: string | null = null, level = 0) => {
    const serviceCategories = categories.filter(c => c.type === CategoryType.SERVICE && c.transactionType === transactionType);
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
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
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
            <Label htmlFor="servicePrice">
              Price
              {vatSettings?.isEnabled && vatSettings?.isVatInclusive && (
                <span className="text-sm text-muted-foreground ml-2">
                  {getVATIndicationText(true)}
                </span>
              )}
            </Label>
            <Input
              id="servicePrice"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            {vatSettings?.isEnabled && vatSettings?.isVatInclusive && (
              <p className="text-xs text-muted-foreground mt-1">
                Enter price including VAT. Base price will be calculated automatically.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="transactionType">Transaction Type</Label>
            <Select value={transactionType} onValueChange={(value) => setTransactionType(value as ProductTransactionType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProductTransactionType.SALES}>Sales</SelectItem>
                <SelectItem value={ProductTransactionType.PURCHASE}>Purchase</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit">{isEditMode ? 'Update Service' : 'Add Service'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}