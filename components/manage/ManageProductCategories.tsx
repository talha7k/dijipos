"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ProductCategory } from '@/lib/types';
import DataTable from '@/components/DataTable';
import ProductCategoryModal from '@/components/modals/ProductCategoryModal';

export default function ManageProductCategories() {
  const { 
    productCategories, 
    fetchProductCategories, 
    addProductCategory, 
    updateProductCategory, 
    deleteProductCategory,
    addSampleProductCategories
  } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProductCategories();
  }, [fetchProductCategories]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: ProductCategory } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (category: ProductCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteProductCategory(id);
      toast({ title: 'Category deleted successfully' });
    }
  };

  const handleSave = async (category: ProductCategory) => {
    if (category.id) {
      await updateProductCategory(category);
    } else {
      await addProductCategory(category);
    }
    setIsModalOpen(false);
    setSelectedCategory(null);
    toast({ title: `Category ${category.id ? 'updated' : 'added'} successfully` });
  };

  const handleAddSampleCategories = async () => {
    await addSampleProductCategories();
    toast({ title: 'Sample product categories added successfully' });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        {productCategories.length === 0 && (
          <Button onClick={handleAddSampleCategories}>Add Sample Categories</Button>
        )}
        <Button onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}>Add New Category</Button>
      </div>
      
      <DataTable columns={columns} data={productCategories} />

      <ProductCategoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCategory(null); }}
        onSave={handleSave}
        category={selectedCategory}
      />
    </div>
  );
}
