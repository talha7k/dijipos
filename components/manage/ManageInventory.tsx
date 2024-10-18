"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Inventory } from '@/lib/types';
import DataTable from '@/components/DataTable';
import InventoryModal from '@/components/modals/InventoryModal';
import { Timestamp } from 'firebase/firestore';

export default function ManageInventory() {
  const { inventory, fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const columns = [
    { accessorKey: 'product.name_en', header: 'Product' },
    { accessorKey: 'quantity_in_stock', header: 'Quantity in Stock' },
    { accessorKey: 'unit_of_measure', header: 'Unit of Measure' },
    { accessorKey: 'reorder_level', header: 'Reorder Level' },
    { 
      accessorKey: 'last_restocked_at', 
      header: 'Last Restocked', 
      cell: ({ row }: { row: { original: Inventory } }) => 
        row.original.last_restocked_at instanceof Timestamp
          ? row.original.last_restocked_at.toDate().toLocaleDateString()
          : 'N/A'
    },
    { 
      accessorKey: 'expiry_date', 
      header: 'Expiry Date', 
      cell: ({ row }: { row: { original: Inventory } }) => 
        row.original.expiry_date === 'non-perishable' 
          ? 'Non-perishable' 
          : row.original.expiry_date instanceof Timestamp
            ? row.original.expiry_date.toDate().toLocaleDateString()
            : 'N/A'
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Inventory } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (item: Inventory) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      await deleteInventoryItem(id);
      toast({ title: 'Inventory item deleted successfully' });
    }
  };

  const handleSave = async (item: Omit<Inventory, 'id' | 'created_at' | 'created_by'>) => {
    if (selectedItem) {
      await updateInventoryItem({ ...selectedItem, ...item });
    } else {
      await addInventoryItem(item);
    }
    setIsModalOpen(false);
    setSelectedItem(null);
    toast({ title: `Inventory item ${selectedItem ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}>Add New Inventory Item</Button>
      </div>
      
      <DataTable columns={columns} data={inventory} />

      <InventoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedItem(null); }}
        onSave={handleSave}
        inventory={selectedItem}
      />
    </div>
  );
}
