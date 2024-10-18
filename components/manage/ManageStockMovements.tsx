"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { StockMovement } from '@/lib/types';
import DataTable from '@/components/DataTable';
import StockMovementModal from '@/components/modals/StockMovementModal';

export default function ManageStockMovements() {
  const { stockMovements, fetchStockMovements, addStockMovement, updateStockMovement, deleteStockMovement } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStockMovement, setSelectedStockMovement] = useState<StockMovement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchStockMovements();
  }, [fetchStockMovements]);

  const columns = [
    { accessorKey: 'inventory_id', header: 'Inventory ID' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'movement_type', header: 'Movement Type' },
    { accessorKey: 'reason', header: 'Reason' },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: StockMovement } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (stockMovement: StockMovement) => {
    setSelectedStockMovement(stockMovement);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stock movement?')) {
      await deleteStockMovement(id);
      toast({ title: 'Stock movement deleted successfully' });
    }
  };

  const handleSave = async (stockMovement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>) => {
    if (selectedStockMovement) {
      await updateStockMovement({ ...selectedStockMovement, ...stockMovement });
    } else {
      await addStockMovement(stockMovement);
    }
    setIsModalOpen(false);
    setSelectedStockMovement(null);
    toast({ title: `Stock movement ${selectedStockMovement ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedStockMovement(null); setIsModalOpen(true); }}>Add New Stock Movement</Button>
      </div>
      
      <DataTable columns={columns} data={stockMovements} />

      <StockMovementModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedStockMovement(null); }}
        onSave={handleSave}
        stockMovement={selectedStockMovement}
      />
    </div>
  );
}
