"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, CategoryType, ProductTransactionType } from "@/types";
import { CategoryTree } from "./CategoryTree";

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (category: {
    name: string;
    description: string;
    type: CategoryType;
    parentId: string | null;
    transactionType: ProductTransactionType;
  }) => void;
  categories: Category[];
  defaultType?: CategoryType;
  defaultTransactionType?: ProductTransactionType;
  selectedParentId?: string | null;
  allowTransactionTypeChange?: boolean;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onAddCategory,
  categories,
  defaultType = CategoryType.PRODUCT,
  defaultTransactionType = ProductTransactionType.SALES,
  selectedParentId: propSelectedParentId,
  allowTransactionTypeChange = true,
}: AddCategoryDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CategoryType>(defaultType);
  const [transactionType, setTransactionType] =
    useState<ProductTransactionType>(defaultTransactionType);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(
    propSelectedParentId || null,
  );

  // Custom hook to track previous values
  function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  const prevDefaultType = usePrevious(defaultType);
  const prevDefaultTransactionType = usePrevious(defaultTransactionType);
  const prevPropSelectedParentId = usePrevious(propSelectedParentId);

  useEffect(() => {
    if (prevDefaultType !== defaultType) setType(defaultType);
    if (prevDefaultTransactionType !== defaultTransactionType) setTransactionType(defaultTransactionType);
    if (prevPropSelectedParentId !== propSelectedParentId) setSelectedParentId(propSelectedParentId || null);
  }, [defaultType, defaultTransactionType, propSelectedParentId, prevDefaultType, prevDefaultTransactionType, prevPropSelectedParentId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddCategory({
      name,
      description,
      type,
      parentId: selectedParentId,
      transactionType,
    });

    // Reset form
    setName("");
    setDescription("");
    setType(defaultType);
    setTransactionType(defaultTransactionType);
    setSelectedParentId(null);
    onOpenChange(false);
  };

  const filteredCategories = categories.filter((c) => c.type === type && c.transactionType === transactionType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Category Tree */}
            <div>
              <Label>Parent Category (Optional)</Label>
              <Card className="mt-2 h-96">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Select where to add this category
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 overflow-auto max-h-64">
                  <Button
                    type="button"
                    variant={selectedParentId === null ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedParentId(null);
                    }}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-3" />
                      <span>Root Level (No Parent)</span>
                    </div>
                    <Badge
                      variant={
                        selectedParentId === null ? "default" : "secondary"
                      }
                    >
                      Top Level
                    </Badge>
                  </Button>

                    <CategoryTree
                      categories={filteredCategories}
                      products={[]}
                      services={[]}
                      selectedCategory={selectedParentId}
                      onCategorySelect={setSelectedParentId}
                      onCategoryDelete={() => {}} // No delete functionality in this context
                      type={type}
                      transactionType={transactionType}
                      showAllOption={false}
                    />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoryType">Type</Label>
                  <Select
                    value={type}
                    onValueChange={(value: string) => {
                      setType(value as CategoryType);
                      setSelectedParentId(null); // Reset parent selection when type changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CategoryType.PRODUCT}>
                        Products
                      </SelectItem>
                      <SelectItem value={CategoryType.SERVICE}>
                        Services
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select
                    value={transactionType}
                    onValueChange={(value) =>
                      allowTransactionTypeChange && setTransactionType(value as ProductTransactionType)
                    }
                    disabled={!allowTransactionTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transaction type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ProductTransactionType.SALES}>
                        Sales
                      </SelectItem>
                      <SelectItem value={ProductTransactionType.PURCHASE}>
                        Purchase
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Parent Category</Label>
                  <div className="mt-2">
                    <Input
                      value={
                        selectedParentId
                          ? filteredCategories.find(
                              (c) => c.id === selectedParentId,
                            )?.name || "Unknown Category"
                          : "Root Level (No Parent)"
                      }
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Category</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
