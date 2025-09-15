'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableStatus } from '@/types';
import { Plus } from 'lucide-react';

interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTable: (table: {
    name: string;
    capacity: number;
    status: TableStatus;
  }) => void;
  onAddMultipleTables?: (tables: Array<{
    name: string;
    capacity: number;
    status: TableStatus;
  }>) => void;
}

export function AddTableDialog({
  open,
  onOpenChange,
  onAddTable,
  onAddMultipleTables,
}: AddTableDialogProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [bulkCount, setBulkCount] = useState('');
  const [bulkCapacity, setBulkCapacity] = useState('');
  const [status, setStatus] = useState<TableStatus>(TableStatus.AVAILABLE);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'single') {
      onAddTable({
        name,
        capacity: parseInt(capacity),
        status,
      });

      // Reset form
      setName('');
      setCapacity('');
    } else if (mode === 'bulk' && onAddMultipleTables) {
      const count = parseInt(bulkCount);
      const tables = [];

      for (let i = 1; i <= count; i++) {
        tables.push({
          name: `Table ${i}`,
          capacity: parseInt(bulkCapacity),
          status,
        });
      }

      onAddMultipleTables(tables);

      // Reset form
      setBulkCount('');
      setBulkCapacity('');
    }

    setStatus(TableStatus.AVAILABLE);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Table
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Table{mode === 'bulk' ? 's' : ''}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={!onAddMultipleTables}
              >
                Bulk Create
              </Button>
            </div>
          </div>
          {mode === 'single' ? (
            <>
              <div>
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Table 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="tableCapacity">Capacity</Label>
                <Input
                  id="tableCapacity"
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Number of seats"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="bulkCount">Number of Tables</Label>
                <Input
                  id="bulkCount"
                  type="number"
                  min="1"
                  max="50"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  placeholder="How many tables to create?"
                  required
                />
              </div>
              <div>
                <Label htmlFor="bulkCapacity">Default Capacity</Label>
                <Input
                  id="bulkCapacity"
                  type="number"
                  min="1"
                  value={bulkCapacity}
                  onChange={(e) => setBulkCapacity(e.target.value)}
                  placeholder="Seats per table"
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Tables will be named: Table 1, Table 2, Table 3, etc.
              </div>
            </>
          )}
          <div>
            <Label htmlFor="tableStatus">Status</Label>
            <Select value={status} onValueChange={(value: TableStatus) => setStatus(value)}>
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
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'single' ? 'Add Table' : `Add ${bulkCount || 0} Tables`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}