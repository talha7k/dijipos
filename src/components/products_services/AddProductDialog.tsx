'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Product, Category, CategoryType, ProductTransactionType, ItemType } from '@/types';
import { useAtomValue } from 'jotai';
import { vatSettingsAtom } from '@/atoms/posAtoms';
import { getVATIndicationText } from '@/lib/vat-calculator';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (productId: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  productToEdit: Product | null;
  categories: Category[];
  selectedCategory?: string | null;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
  categories,
  selectedCategory
}: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<ProductTransactionType>(ProductTransactionType.SALES);
  const vatSettings = useAtomValue(vatSettingsAtom);

  const isEditMode = productToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
      setName(productToEdit.name);
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price.toString());
      setCategoryId(productToEdit.categoryId || '');
      setTransactionType(productToEdit.transactionType);
    } else {
      // Reset form for adding new product
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(selectedCategory || '');
      setTransactionType(ProductTransactionType.SALES);
    }
  }, [productToEdit, isEditMode, selectedCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      categoryId: categoryId || undefined,
      itemType: ItemType.PRODUCT as const,
      transactionType
    };

    if (isEditMode) {
      onUpdateProduct(productToEdit.id, productData);
    } else {
      onAddProduct(productData);
    }
  };

  const renderCategoryOptions = (parentId: string | null = null, level = 0) => {
    const productCategories = categories.filter(c => c.type === CategoryType.PRODUCT);
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
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
            <Label htmlFor="productPrice">
              Price
              {vatSettings?.isEnabled && vatSettings?.isVatInclusive && (
                <span className="text-sm text-muted-foreground ml-2">
                  {getVATIndicationText(true)}
                </span>
              )}
            </Label>
            <Input
              id="productPrice"
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
            <Button type="submit">{isEditMode ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}