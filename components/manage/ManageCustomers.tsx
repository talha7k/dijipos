"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/lib/types';
import DataTable from '@/components/DataTable';
import CustomerModal from '@/components/modals/CustomerModal';

export default function ManageCustomers() {
  const { customers, fetchCustomers, addCustomer, updateCustomer, deleteCustomer } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phone_number', header: 'Phone Number' },
    {
      id: 'actions',
      cell: ({ row }: { row: { original: Customer } }) => (
        <div>
          <Button onClick={() => handleEdit(row.original)} className="mr-2">Edit</Button>
          <Button onClick={() => handleDelete(row.original.id)} variant="destructive">Delete</Button>
        </div>
      ),
    },
  ];

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
      toast({ title: 'Customer deleted successfully' });
    }
  };

  const handleSave = async (customer: Customer) => {
    if (customer.id) {
      await updateCustomer(customer);
    } else {
      await addCustomer(customer);
    }
    setIsModalOpen(false);
    setSelectedCustomer(null);
    toast({ title: `Customer ${customer.id ? 'updated' : 'added'} successfully` });
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => { setSelectedCustomer(null); setIsModalOpen(true); }}>Add New Customer</Button>
      </div>
      
      <DataTable columns={columns} data={customers} />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCustomer(null); }}
        onSave={handleSave}
        customer={selectedCustomer}
      />
    </div>
  );
}
