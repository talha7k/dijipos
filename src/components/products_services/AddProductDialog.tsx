'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, GripVertical, FolderPlus } from 'lucide-react';
import { Product, Category, CategoryType, ProductTransactionType, ItemType, ProductVariation } from '@/types';
import { useAtomValue } from 'jotai';
import { vatSettingsAtom } from '@/atoms/posAtoms';
import { getVATIndicationText } from '@/lib/vat-calculator';
import { AddCategoryDialog } from './AddCategoryDialog';

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (productId: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  productToEdit: Product | null;
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

export function AddProductDialog({
  open,
  onOpenChange,
  onAddProduct,
  onUpdateProduct,
  productToEdit,
  categories,
  selectedCategory,
  defaultTransactionType = ProductTransactionType.SALES,
  allowTransactionTypeChange = true,
  onAddCategory
}: AddProductDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [transactionType, setTransactionType] = useState<ProductTransactionType>(defaultTransactionType);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [newVariation, setNewVariation] = useState({ name: '', description: '', price: '' });
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const vatSettings = useAtomValue(vatSettingsAtom);

  const isEditMode = productToEdit !== null;

  useEffect(() => {
    if (isEditMode) {
      setName(productToEdit.name);
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price.toString());
      setCategoryId(productToEdit.categoryId || '');
      setTransactionType(productToEdit.transactionType);
      setVariations(productToEdit.variations || []);
    } else {
      // Reset form for adding new product
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(selectedCategory || '');
      setTransactionType(defaultTransactionType);
      setVariations([]);
    }
    setNewVariation({ name: '', description: '', price: '' });
  }, [productToEdit, isEditMode, selectedCategory, defaultTransactionType]);

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
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      categoryId: categoryId || undefined,
      variations: variations.length > 0 ? variations : undefined,
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
    const productCategories = categories.filter(c => c.type === CategoryType.PRODUCT && c.transactionType === transactionType);
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
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
                 <Label htmlFor="productCategory">Category</Label>
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
           <Accordion type="single" collapsible className="w-full">
             <AccordionItem value="variations">
               <AccordionTrigger className="text-sm font-medium">
                 Product Variations (Optional)
               </AccordionTrigger>
               <AccordionContent>
                 <div className="space-y-3">
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
                         placeholder="Variation name (e.g., Small, Large)"
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
               </AccordionContent>
             </AccordionItem>
           </Accordion>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditMode ? 'Update Product' : 'Add Product'}</Button>
          </div>
        </form>
        {onAddCategory && (
          <AddCategoryDialog
            open={showAddCategoryDialog}
            onOpenChange={setShowAddCategoryDialog}
            onAddCategory={onAddCategory}
            categories={categories}
            defaultType={CategoryType.PRODUCT}
            defaultTransactionType={transactionType}
            allowTransactionTypeChange={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}