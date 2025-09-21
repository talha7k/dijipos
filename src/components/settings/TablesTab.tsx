'use client';

import { Table } from '@/types';
import { TableStatus } from '@/types/enums';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Plus, Sofa } from 'lucide-react';


import { TableCard } from '@/components/tables/TableCard';
import { useState } from 'react';
import { addDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';


interface TablesTabProps {
  tables: Table[];
}

export function TablesTab({ tables }: TablesTabProps) {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;

  // Local state management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [newTable, setNewTable] = useState({
    name: '',
    capacity: 1,
    status: TableStatus.AVAILABLE
  });
  const [bulkCount, setBulkCount] = useState('');
  const [bulkCapacity, setBulkCapacity] = useState('');

  // Table management functions
  const handleAddTable = async () => {
    if (!organizationId) return;

    try {
      if (mode === 'single') {
        if (!newTable.name.trim()) return;
        
        await addDoc(collection(db, 'organizations', organizationId, 'tables'), {
          ...newTable,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        setNewTable({ name: '', capacity: 1, status: TableStatus.AVAILABLE });
        toast.success('Table added successfully');
      } else {
        const count = parseInt(bulkCount);
        const capacity = parseInt(bulkCapacity);
        
        if (!count || !capacity || count < 1 || capacity < 1) return;

        const tables = [];
        for (let i = 1; i <= count; i++) {
          tables.push({
            name: `Table ${i}`,
            capacity,
            status: newTable.status,
            organizationId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        const promises = tables.map(table => 
          addDoc(collection(db, 'organizations', organizationId, 'tables'), table)
        );
        await Promise.all(promises);

        setBulkCount('');
        setBulkCapacity('');
        toast.success(`${count} tables added successfully`);
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding table(s):', error);
      toast.error('Failed to add table(s)');
    }
  };

  const handleDeleteTable = (id: string) => {
    setDeleteTableId(id);
  };

  const confirmDeleteTable = async () => {
    if (!organizationId || !deleteTableId) return;

    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'tables', deleteTableId));
      toast.success('Table deleted successfully');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error('Failed to delete table');
    } finally {
      setDeleteTableId(null);
    }
  };

  

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="h-5 w-5" />
            Tables
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Table{mode === 'bulk' ? 's' : ''}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Mode Selection */}
                <div>
                  <Label>Creation Mode</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={mode === 'single' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('single')}
                      className="flex-1"
                    >
                      Single Table
                    </Button>
                    <Button
                      type="button"
                      variant={mode === 'bulk' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMode('bulk')}
                      className="flex-1"
                    >
                      Bulk Create
                    </Button>
                  </div>
                </div>
                
                {mode === 'single' ? (
                  <>
                    <div>
                      <Label htmlFor="table-name">Name</Label>
                      <Input
                        id="table-name"
                        placeholder="e.g., Table 1, Booth A"
                        value={newTable.name}
                        onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="table-capacity">Capacity</Label>
                      <Input
                        id="table-capacity"
                        type="number"
                        min="1"
                        placeholder="4"
                        value={newTable.capacity}
                        onChange={(e) => setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="bulk-count">Number of Tables</Label>
                      <Input
                        id="bulk-count"
                        type="number"
                        min="1"
                        max="50"
                        placeholder="How many tables to create?"
                        value={bulkCount}
                        onChange={(e) => setBulkCount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bulk-capacity">Default Capacity</Label>
                      <Input
                        id="bulk-capacity"
                        type="number"
                        min="1"
                        placeholder="Seats per table"
                        value={bulkCapacity}
                        onChange={(e) => setBulkCapacity(e.target.value)}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tables will be named: Table 1, Table 2, Table 3, etc.
                    </div>
                  </>
                )}
                
                <div>
                  <Label htmlFor="table-status">Status</Label>
                  <Select
                    value={newTable.status}
                    onValueChange={(value: TableStatus) =>
                      setNewTable({ ...newTable, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TableStatus.AVAILABLE}>Available</SelectItem>
                      <SelectItem value={TableStatus.OCCUPIED}>Occupied</SelectItem>
                      <SelectItem value={TableStatus.RESERVED}>Reserved</SelectItem>
                      <SelectItem value={TableStatus.MAINTENANCE}>Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={() => handleAddTable()} className="w-full">
                  {mode === 'single' ? 'Add Table' : `Add ${bulkCount || 0} Tables`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center py-12">
            <Sofa className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tables added yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Click &quot;Add Table&quot; to get started</p>
          </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onDeleteTable={handleDeleteTable}
                deleteTableId={deleteTableId}
                setDeleteTableId={setDeleteTableId}
                confirmDeleteTable={confirmDeleteTable}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}