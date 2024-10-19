import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StockMovement, Inventory } from '@/lib/types'
import { Timestamp } from 'firebase/firestore';
import { useAppStore } from '@/lib/store';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockMovement: Omit<StockMovement, 'id' | 'created_at' | 'created_by'>) => void;
  stockMovement: StockMovement | null;
}

export default function StockMovementModal({ isOpen, onClose, onSave, stockMovement }: StockMovementModalProps) {
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState<'adjustment' | 'sale' | 'return' | 'transfer'>('adjustment');
  const [reason, setReason] = useState('');

  const { inventory, fetchInventory } = useAppStore();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (stockMovement) {
      setSelectedInventory(stockMovement.inventory);
      setQuantity(stockMovement.quantity.toString());
      setMovementType(stockMovement.movement_type);
      setReason(stockMovement.reason || '');
    } else {
      setSelectedInventory(null);
      setQuantity('');
      setMovementType('adjustment');
      setReason('');
    }
  }, [stockMovement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventory) {
      console.error('No inventory selected');
      return;
    }
    onSave({
      inventory: selectedInventory,
      quantity: parseInt(quantity),
      movement_type: movementType,
      reason: reason,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{stockMovement ? 'Edit Stock Movement' : 'Add New Stock Movement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Select 
              value={selectedInventory?.id} 
              onValueChange={(value) => setSelectedInventory(inventory.find(inv => inv.id === value) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Inventory" />
              </SelectTrigger>
              <SelectContent>
                {inventory.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              required
            />
            <Select value={movementType} onValueChange={(value: 'adjustment' | 'sale' | 'return' | 'transfer') => setMovementType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Movement Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adjustment">Adjustment</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">{stockMovement ? 'Update' : 'Add'} Stock Movement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
