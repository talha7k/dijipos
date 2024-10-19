"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Supplier } from '@/lib/types';
import DataTable from '@/components/DataTable';
import SupplierModal from '@/components/modals/SupplierModal';
import { Timestamp } from 'firebase/firestore';

export default function ManageSuppliers() {
  const { suppliers, fetchSuppliers, addSupplier, updateSupplier, deleteSupplier } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'contact.email', header: 'Email' },
    { accessorKey: 'contact.phone', header: 'Phone' },
    { 
      accessorKey: 'created_at', 
      header: 'Created At', 
      cell: ({ row }: { row: { original: Supplier } }) => {
        const timestamp = row.original.created_at;
        if (timestamp instanceof Timestamp) {
          return new Date(timestamp.toDate()).toLocaleString();
        }
        return 'Invalid Date';
      }
    },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Supplier } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      await deleteSupplier(id);
      toast({ title: 'Supplier deleted successfully' });
    }
  };

  const handleSave = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'created_by'>) => {
    if (selectedSupplier) {
      await updateSupplier({ ...selectedSupplier, ...supplier });
    } else {
      await addSupplier(supplier);
    }
    setIsModalOpen(false);
    setSelectedSupplier(null);
    toast({ title: `Supplier ${selectedSupplier ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedSupplier(null); setIsModalOpen(true); }}>Add New Supplier</Button>
      </div>
      
      <DataTable columns={columns} data={suppliers} />

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedSupplier(null); }}
        onSave={handleSave}
        supplier={selectedSupplier}
      />
    </div>
  );
}
