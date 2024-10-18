"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PaymentType } from '@/lib/types';
import DataTable from '@/components/DataTable';
import PaymentTypeModal from '@/components/modals/PaymentTypeModal';

export default function ManagePaymentTypes() {
  const { paymentTypes, fetchPaymentTypes, addPaymentType, updatePaymentType, deletePaymentType } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentTypes();
  }, [fetchPaymentTypes]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: PaymentType } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment type?')) {
      await deletePaymentType(id);
      toast({ title: 'Payment type deleted successfully' });
    }
  };

  const handleSave = async (paymentType: PaymentType) => {
    if (paymentType.id) {
      await updatePaymentType(paymentType);
    } else {
      await addPaymentType(paymentType);
    }
    setIsModalOpen(false);
    setSelectedPaymentType(null);
    toast({ title: `Payment type ${paymentType.id ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedPaymentType(null); setIsModalOpen(true); }}>Add New Payment Type</Button>
      </div>
      
      <DataTable columns={columns} data={paymentTypes} />

      <PaymentTypeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPaymentType(null); }}
        onSave={handleSave}
        paymentType={selectedPaymentType}
      />
    </div>
  );
}
