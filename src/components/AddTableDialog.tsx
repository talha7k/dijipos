'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface AddTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTable: (table: {
    name: string;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  }) => void;
}

export function AddTableDialog({
  open,
  onOpenChange,
  onAddTable,
}: AddTableDialogProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState<'available' | 'occupied' | 'reserved' | 'maintenance'>('available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onAddTable({
      name,
      capacity: parseInt(capacity),
      status,
    });

    // Reset form
    setName('');
    setCapacity('');
    setStatus('available');
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Table</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div>
            <Label htmlFor="tableStatus">Status</Label>
            <Select value={status} onValueChange={(value: 'available' | 'occupied' | 'reserved' | 'maintenance') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Table</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}