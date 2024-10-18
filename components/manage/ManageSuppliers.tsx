"use client"

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Supplier } from '@/lib/types';
import DataTable from './DataTable';

export default function ManageSuppliers() {
  const { suppliers, fetchSuppliers } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'contact.phone', header: 'Phone' },
    { accessorKey: 'contact.email', header: 'Email' },
    { accessorKey: 'contact.address', header: 'Address' },
    { accessorKey: 'created_at', header: 'Created At', cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString() },
  ];

  return (
    <div>
      <DataTable columns={columns} data={suppliers} />
    </div>
  );
}