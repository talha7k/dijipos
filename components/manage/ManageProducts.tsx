"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DataTable from '@/components/DataTable';
import ProductModal from '@/components/modals/ProductModal';
import { Product } from '@/lib/types';

export default function ManageProducts() {
  const { 
    products, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct
  } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    { 
      accessorKey: 'price', 
      header: 'Price', 
      cell: ({ row }: { row: { original: Product } }) => `$${row.original.price.toFixed(2)}` 
    },
    { accessorKey: 'category_id', header: 'Category ID' },
    { 
      accessorKey: 'is_available', 
      header: 'Available', 
      cell: ({ row }: { row: { original: Product } }) => row.original.is_available ? 'Yes' : 'No' 
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Product } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      toast({ title: 'Product deleted successfully' });
    }
  };

  const handleSave = async (product: Omit<Product, 'id' | 'created_at' | 'business_id' | 'created_by'>) => {
    if (selectedProduct) {
      await updateProduct({ ...selectedProduct, ...product });
    } else {
      await addProduct(product);
    }
    setIsModalOpen(false);
    setSelectedProduct(null);
    toast({ title: `Product ${selectedProduct ? 'updated' : 'added'} successfully` });
  };

  const addSampleProducts = async () => {
    const sampleProducts: Omit<Product, 'id' | 'created_at' | 'business_id' | 'created_by'>[] = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        category_id: '1',
        is_available: true,
      },
      {
        name: 'Chicken Shawarma',
        description: 'Grilled chicken wrapped in pita bread with vegetables and sauce',
        price: 8.99,
        category_id: '2',
        is_available: true,
      },
      {
        name: 'Falafel Plate',
        description: 'Deep-fried chickpea balls served with hummus and salad',
        price: 10.99,
        category_id: '3',
        is_available: true,
      },
    ];

    for (const product of sampleProducts) {
      await addProduct(product);
    }

    toast({ title: 'Sample products added successfully' });
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <Button onClick={addSampleProducts}>Add Sample Products</Button>
        <Button onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}>Add New Product</Button>
      </div>
      
      <DataTable columns={columns} data={products} />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
        onSave={handleSave}
        product={selectedProduct}
      />
    </div>
  );
}