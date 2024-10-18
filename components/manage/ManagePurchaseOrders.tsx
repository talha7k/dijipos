"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PurchaseOrder } from '@/lib/types';
import DataTable from '@/components/DataTable';
import PurchaseOrderModal from '@/components/modals/PurchaseOrderModal';

export default function ManagePurchaseOrders() {
  const { purchaseOrders, fetchPurchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const columns = [
    { accessorKey: 'id', header: 'Order ID' },
    { accessorKey: 'supplier.name', header: 'Supplier' },
    { accessorKey: 'total_amount', header: 'Total Amount', cell: ({ row }: { row: { original: PurchaseOrder } }) => `$${row.original.total_amount.toFixed(2)}` },
    { accessorKey: 'order_status', header: 'Status' },
    { accessorKey: 'created_at', header: 'Ordered At', cell: ({ row }: { row: { original: PurchaseOrder } }) => new Date(row.original.created_at.seconds * 1000).toLocaleString() },
    { accessorKey: 'received_at', header: 'Received At', cell: ({ row }: { row: { original: PurchaseOrder } }) => row.original.received_at ? new Date(row.original.received_at.seconds * 1000).toLocaleString() : 'Not received' },
    { accessorKey: 'supplier_id', header: 'Supplier ID' },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: PurchaseOrder } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      await deletePurchaseOrder(id);
      toast({ title: 'Purchase order deleted successfully' });
    }
  };

  const handleSave = async (purchaseOrder: Omit<PurchaseOrder, 'id' | 'created_at'>) => {
    if (selectedPurchaseOrder) {
      await updatePurchaseOrder({ ...selectedPurchaseOrder, ...purchaseOrder });
    } else {
      await addPurchaseOrder(purchaseOrder);
    }
    setIsModalOpen(false);
    setSelectedPurchaseOrder(null);
    toast({ title: `Purchase order ${selectedPurchaseOrder ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedPurchaseOrder(null); setIsModalOpen(true); }}>Add New Purchase Order</Button>
      </div>
      
      <DataTable columns={columns} data={purchaseOrders} />

      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPurchaseOrder(null); }}
        onSave={handleSave}
        purchaseOrder={selectedPurchaseOrder}
      />
    </div>
  );
}
