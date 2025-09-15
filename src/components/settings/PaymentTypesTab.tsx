'use client';

import { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthState } from '@/hooks/useAuthState';
import { PaymentType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentTypesTabProps {
  paymentTypes: PaymentType[];
  onRefresh?: () => void;
}

export function PaymentTypesTab({ paymentTypes, onRefresh }: PaymentTypesTabProps) {
  const { organizationId } = useAuthState();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletePaymentTypeId, setDeletePaymentTypeId] = useState<string | null>(null);
  const [newPaymentType, setNewPaymentType] = useState({ name: '', description: '' });

  const handleAddPaymentType = async () => {
    if (!organizationId || !newPaymentType.name.trim()) return;

    await addDoc(collection(db, 'organizations', organizationId, 'paymentTypes'), {
      ...newPaymentType,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewPaymentType({ name: '', description: '' });
    setDialogOpen(false);
    onRefresh?.();
    toast.success('Payment type added successfully');
  };

  const handleDeletePaymentType = (id: string) => {
    setDeletePaymentTypeId(id);
  };

  const confirmDeletePaymentType = async () => {
    if (!organizationId || !deletePaymentTypeId) return;
    
    try {
      await deleteDoc(doc(db, 'organizations', organizationId, 'paymentTypes', deletePaymentTypeId));
      toast.success('Payment type deleted successfully');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting payment type:', error);
      toast.error('Failed to delete payment type');
    } finally {
      setDeletePaymentTypeId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Types
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-name">Name</Label>
                  <Input
                    id="payment-name"
                    placeholder="e.g., Cash, Card, Online"
                    value={newPaymentType.name}
                    onChange={(e) => setNewPaymentType({ ...newPaymentType, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payment-description">Description (Optional)</Label>
                  <Input
                    id="payment-description"
                    placeholder="Description for this payment type"
                    value={newPaymentType.description}
                    onChange={(e) => setNewPaymentType({ ...newPaymentType, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddPaymentType} className="w-full">
                  Add Payment Type
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentTypes.length === 0 ? (
          <p className="text-muted-foreground">No payment types added yet.</p>
        ) : (
          <div className="grid gap-2">
            {paymentTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <h3 className="font-medium">{type.name}</h3>
                  {type.description && (
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  )}
                </div>
                <AlertDialog open={deletePaymentTypeId === type.id} onOpenChange={(open) => !open && setDeletePaymentTypeId(null)}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePaymentType(type.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the payment type &ldquo;{type.name}&rdquo;. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeletePaymentTypeId(null)}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeletePaymentType} className="bg-destructive text-destructive-foreground">
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