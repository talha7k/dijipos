'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { OrderType, PaymentType, VATSettings } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Trash2, UtensilsCrossed, CreditCard, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function SettingsContent() {
  const { tenantId } = useAuth();
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [orderTypeDialogOpen, setOrderTypeDialogOpen] = useState(false);
  const [paymentTypeDialogOpen, setPaymentTypeDialogOpen] = useState(false);
  const [vatDialogOpen, setVatDialogOpen] = useState(false);

  // Form states
  const [newOrderType, setNewOrderType] = useState({ name: '', description: '' });
  const [newPaymentType, setNewPaymentType] = useState({ name: '', description: '' });
  const [newVatSettings, setNewVatSettings] = useState({ rate: 0, isEnabled: true });

  useEffect(() => {
    if (!tenantId) return;

    // Fetch order types
    const orderTypesQ = query(collection(db, 'tenants', tenantId, 'orderTypes'));
    const orderTypesUnsubscribe = onSnapshot(orderTypesQ, (querySnapshot) => {
      const orderTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as OrderType[];
      setOrderTypes(orderTypesData);
    });

    // Fetch payment types
    const paymentTypesQ = query(collection(db, 'tenants', tenantId, 'paymentTypes'));
    const paymentTypesUnsubscribe = onSnapshot(paymentTypesQ, (querySnapshot) => {
      const paymentTypesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as PaymentType[];
      setPaymentTypes(paymentTypesData);
    });

    // Fetch VAT settings
    const fetchVatSettings = async () => {
      const vatDoc = await getDoc(doc(db, 'tenants', tenantId, 'settings', 'vat'));
      if (vatDoc.exists()) {
        const vatData = vatDoc.data() as VATSettings;
        setVatSettings({
          ...vatData,
          createdAt: vatData.createdAt,
          updatedAt: vatData.updatedAt,
        });
      } else {
        // Create default VAT settings
        const defaultVat: VATSettings = {
          id: 'vat',
          rate: 15,
          isEnabled: true,
          tenantId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'tenants', tenantId, 'settings', 'vat'), defaultVat);
        setVatSettings(defaultVat);
      }
    };

    fetchVatSettings();
    setLoading(false);

    return () => {
      orderTypesUnsubscribe();
      paymentTypesUnsubscribe();
    };
  }, [tenantId]);

  const handleAddOrderType = async () => {
    if (!tenantId || !newOrderType.name.trim()) return;

    await addDoc(collection(db, 'tenants', tenantId, 'orderTypes'), {
      ...newOrderType,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewOrderType({ name: '', description: '' });
    setOrderTypeDialogOpen(false);
  };

  const handleAddPaymentType = async () => {
    if (!tenantId || !newPaymentType.name.trim()) return;

    await addDoc(collection(db, 'tenants', tenantId, 'paymentTypes'), {
      ...newPaymentType,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewPaymentType({ name: '', description: '' });
    setPaymentTypeDialogOpen(false);
  };

  const handleUpdateVatSettings = async () => {
    if (!tenantId) return;

    const updatedVat: VATSettings = {
      id: 'vat',
      ...newVatSettings,
      tenantId,
      createdAt: vatSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'tenants', tenantId, 'settings', 'vat'), updatedVat);
    setVatSettings(updatedVat);
    setVatDialogOpen(false);
  };

  const handleDeleteOrderType = async (id: string) => {
    if (!tenantId) return;
    if (confirm('Are you sure you want to delete this order type?')) {
      await deleteDoc(doc(db, 'tenants', tenantId, 'orderTypes', id));
    }
  };

  const handleDeletePaymentType = async (id: string) => {
    if (!tenantId) return;
    if (confirm('Are you sure you want to delete this payment type?')) {
      await deleteDoc(doc(db, 'tenants', tenantId, 'paymentTypes', id));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Store Settings</h1>
      </div>

      <Tabs defaultValue="order-types" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="order-types">Order Types</TabsTrigger>
          <TabsTrigger value="payment-types">Payment Types</TabsTrigger>
          <TabsTrigger value="vat-settings">VAT Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="order-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Order Types
                </div>
                <Dialog open={orderTypeDialogOpen} onOpenChange={setOrderTypeDialogOpen}>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOrderType(type.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Types
                </div>
                <Dialog open={paymentTypeDialogOpen} onOpenChange={setPaymentTypeDialogOpen}>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePaymentType(type.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  VAT Settings
                </div>
                <Dialog open={vatDialogOpen} onOpenChange={setVatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Update VAT Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update VAT Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="vat-enabled"
                          checked={newVatSettings.isEnabled}
                          onCheckedChange={(checked) => setNewVatSettings({ ...newVatSettings, isEnabled: checked })}
                        />
                        <Label htmlFor="vat-enabled">Enable VAT</Label>
                      </div>
                      {newVatSettings.isEnabled && (
                        <div>
                          <Label htmlFor="vat-rate">VAT Rate (%)</Label>
                          <Input
                            id="vat-rate"
                            type="number"
                            placeholder="15"
                            value={newVatSettings.rate}
                            onChange={(e) => setNewVatSettings({ ...newVatSettings, rate: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                      <Button onClick={handleUpdateVatSettings} className="w-full">
                        Update Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vatSettings ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={vatSettings.isEnabled ? "default" : "secondary"}>
                      {vatSettings.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  {vatSettings.isEnabled && (
                    <div className="flex items-center justify-between">
                      <span>VAT Rate:</span>
                      <span className="font-medium">{vatSettings.rate}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">VAT settings not configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}