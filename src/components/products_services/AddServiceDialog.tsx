'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, FolderPlus } from 'lucide-react';
import { Service, Category, CategoryType, ProductTransactionType, ItemType, ProductVariation } from '@/types';
import { useAtomValue } from 'jotai';
import { vatSettingsAtom } from '@/atoms/posAtoms';
import { getVATIndicationText } from '@/lib/vat-calculator';
import { AddCategoryDialog } from './AddCategoryDialog';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddService: (service: Omit<Service, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateService: (serviceId: string, service: Partial<Omit<Service, 'id' | 'createdAt'>>) => void;
  serviceToEdit: Service | null;
  categories: Category[];
  selectedCategory?: string | null;
  defaultTransactionType?: ProductTransactionType;
  allowTransactionTypeChange?: boolean;
  onAddCategory?: (category: {
    name: string;
    description: string;
    type: CategoryType;
    parentId: string | null;
    transactionType: ProductTransactionType;
  }) => void;
}

export function AddServiceDialog({
  open,
  onOpenChange,
  onAddService,
  onUpdateService,
  serviceToEdit,
  categories,
  selectedCategory,
  defaultTransactionType = ProductTransactionType.SALES,
  allowTransactionTypeChange = true,
  onAddCategory
}: AddServiceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<ProductTransactionType>(defaultTransactionType);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVariation, setNewVariation] = useState({ name: '', description: '', price: '' });
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const vatSettings = useAtomValue(vatSettingsAtom);

  const isEditMode = serviceToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description || '');
      setPrice(serviceToEdit.price.toString());
      setCategoryId(serviceToEdit.categoryId || '');
      setTransactionType(serviceToEdit.transactionType);
      setVariations(serviceToEdit.variations || []);
    } else {
      // Reset form for adding new service
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(selectedCategory || '');
      setTransactionType(defaultTransactionType);
      setVariations([]);
    }
    setNewVariation({ name: '', description: '', price: '' });
  }, [serviceToEdit, isEditMode, selectedCategory, defaultTransactionType]);

  const addVariation = () => {
    if (newVariation.name && newVariation.price) {
      const variation: ProductVariation = {
        id: `var-${Date.now()}`,
        name: newVariation.name,
        description: newVariation.description || undefined,
        price: parseFloat(newVariation.price)
      };
      setVariations([...variations, variation]);
      setNewVariation({ name: '', description: '', price: '' });
    }
  };

  const removeVariation = (id: string) => {
    setVariations(variations.filter(v => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData = {
      name,
      description,
      price: parseFloat(price),
      categoryId: categoryId || undefined,
      variations: variations.length > 0 ? variations : undefined,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
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
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="transactionType">Transaction Type</Label>
                <Select
                  value={transactionType}
                  onValueChange={(value) => allowTransactionTypeChange && setTransactionType(value as ProductTransactionType)}
                  disabled={!allowTransactionTypeChange}
                >
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
                 <div className="flex gap-2">
                   <Select value={categoryId} onValueChange={setCategoryId}>
                     <SelectTrigger className="flex-1">
                       <SelectValue placeholder="Select a category" />
                     </SelectTrigger>
                     <SelectContent>
                       {renderCategoryOptions()}
                     </SelectContent>
                   </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowAddCategoryDialog(true)}
                      title="Add new category"
                    >
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                 </div>
               </div>
            </div>
          </div>
          
          {/* Variations Section */}
          <div>
            <Label>Service Variations (Optional)</Label>
            <div className="space-y-3 mt-2">
              {/* Existing Variations */}
              {variations.map((variation, index) => (
                <div key={variation.id} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">{variation.name}</div>
                    {variation.description && (
                      <div className="text-sm text-muted-foreground">{variation.description}</div>
                    )}
                    <div className="text-sm font-medium">${variation.price.toFixed(2)}</div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariation(variation.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* Add New Variation */}
              <div className="space-y-2 p-3 border rounded-md border-dashed">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Variation name (e.g., Basic, Premium)"
                    value={newVariation.name}
                    onChange={(e) => setNewVariation({ ...newVariation, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={newVariation.price}
                    onChange={(e) => setNewVariation({ ...newVariation, price: e.target.value })}
                  />
                </div>
                <Input
                  placeholder="Description (optional)"
                  value={newVariation.description}
                  onChange={(e) => setNewVariation({ ...newVariation, description: e.target.value })}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                  disabled={!newVariation.name || !newVariation.price}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? 'Update Service' : 'Add Service'}</Button>
          </div>
        </form>
        {onAddCategory && (
          <AddCategoryDialog
            open={showAddCategoryDialog}
            onOpenChange={setShowAddCategoryDialog}
            onAddCategory={onAddCategory}
            categories={categories}
            defaultType={CategoryType.SERVICE}
            defaultTransactionType={transactionType}
            allowTransactionTypeChange={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}