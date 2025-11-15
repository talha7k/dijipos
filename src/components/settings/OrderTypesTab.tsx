'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UtensilsCrossed, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';

export function OrderTypesTab() {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { storeSettings, createNewOrderType, deleteExistingOrderType, loading } = useStoreSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOrderTypeId, setDeleteOrderTypeId] = useState<string | null>(null);
  const [newOrderType, setNewOrderType] = useState({ name: '', description: '', commission: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOrderType = async () => {
    if (!organizationId || !newOrderType.name.trim()) return;

    setIsSubmitting(true);
    try {
      await createNewOrderType({
        name: newOrderType.name,
        description: newOrderType.description,
        commission: newOrderType.commission ? parseFloat(newOrderType.commission) : undefined,
        organizationId,
      });

      setNewOrderType({ name: '', description: '', commission: '' });
      setDialogOpen(false);
      toast.success('Order type added successfully');
    } catch (error) {
      console.error('Error creating order type:', error);
      toast.error('Failed to create order type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrderType = (id: string) => {
    setDeleteOrderTypeId(id);
  };

  const confirmDeleteOrderType = async () => {
    if (!organizationId || !deleteOrderTypeId) return;

    setIsSubmitting(true);
    try {
      await deleteExistingOrderType(deleteOrderTypeId);
      toast.success('Order type deleted successfully');
    } catch (error) {
      console.error('Error deleting order type:', error);
      toast.error('Failed to delete order type');
    } finally {
      setDeleteOrderTypeId(null);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader size="lg" />
          <p className="text-muted-foreground mt-4">Loading order types...</p>
        </CardContent>
      </Card>
    );
  }

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
                <div>
                  <Label htmlFor="order-commission">Commission (optional)</Label>
                  <Input
                    id="order-commission"
                    placeholder="e.g., 2.5"
                    value={newOrderType.commission}
                    onChange={(e) => setNewOrderType({ ...newOrderType, commission: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddOrderType} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Order Type'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {(storeSettings?.orderTypes || []).length === 0 ? (
          <p className="text-muted-foreground">No order types added yet.</p>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(storeSettings?.orderTypes || []).map((type) => (
              <Card key={type.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20 relative">
                <CardHeader className="pb-2">
                  {/* Delete Button */}
                  <div className="absolute top-2 right-2">
                    <AlertDialog open={deleteOrderTypeId === type.id} onOpenChange={(open) => !open && setDeleteOrderTypeId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrderType(type.id);
                          }}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                          <AlertDialogAction onClick={confirmDeleteOrderType} className="bg-destructive text-destructive-foreground" disabled={isSubmitting}>
                            {isSubmitting ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex flex-col items-center text-center space-y-4">
                    {/* Order Type Icon */}
                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
                      <UtensilsCrossed className="h-8 w-8 text-primary" />
                    </div>

                    {/* Order Type Info */}
                    <div className="space-y-2 w-full">
                      <h3 className="font-semibold text-lg truncate">{type.name}</h3>
                      {type.description && (
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      )}
                      {type.commission && (
                        <p className="text-sm text-muted-foreground">Commission: {type.commission}%</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}