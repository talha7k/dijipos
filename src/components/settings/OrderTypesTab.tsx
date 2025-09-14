'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { OrderType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UtensilsCrossed, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderTypesTabProps {
  orderTypes: OrderType[];
  onRefresh?: () => void;
}

export function OrderTypesTab({ orderTypes, onRefresh }: OrderTypesTabProps) {
  const { organizationId } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOrderTypeId, setDeleteOrderTypeId] = useState<string | null>(null);
  const [newOrderType, setNewOrderType] = useState({ name: '', description: '' });

  const handleAddOrderType = async () => {
    if (!organizationId || !newOrderType.name.trim()) return;

    await addDoc(collection(db, 'organizations', organizationId, 'orderTypes'), {
      ...newOrderType,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewOrderType({ name: '', description: '' });
    setDialogOpen(false);
    onRefresh?.();
    toast.success('Order type added successfully');
  };

  const handleDeleteOrderType = (id: string) => {
    setDeleteOrderTypeId(id);
  };

  const confirmDeleteOrderType = async () => {
    if (!organizationId || !deleteOrderTypeId) return;
    
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'orderTypes', deleteOrderTypeId));
      toast.success('Order type deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting order type:', error);
      toast.error('Failed to delete order type');
    } finally {
      setDeleteOrderTypeId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5" />
            Order Types
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Order Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Order Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="order-name">Name</Label>
                  <Input
                    id="order-name"
                    placeholder="e.g., Dine In, Take Away, Delivery"
                    value={newOrderType.name}
                    onChange={(e) => setNewOrderType({ ...newOrderType, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="order-description">Description (Optional)</Label>
                  <Input
                    id="order-description"
                    placeholder="Description for this order type"
                    value={newOrderType.description}
                    onChange={(e) => setNewOrderType({ ...newOrderType, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddOrderType} className="w-full">
                  Add Order Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orderTypes.length === 0 ? (
          <p className="text-muted-foreground">No order types added yet.</p>
        ) : (
          <div className="grid gap-2">
            {orderTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  {type.description && (
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  )}
                </div>
                <AlertDialog open={deleteOrderTypeId === type.id} onOpenChange={(open) => !open && setDeleteOrderTypeId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOrderType(type.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the order type &ldquo;{type.name}&rdquo;. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteOrderTypeId(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeleteOrderType} className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}