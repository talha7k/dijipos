'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import { VATSettings } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Percent, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface StoreSettingsTabProps {
  vatSettings: VATSettings | null;
  onVatSettingsUpdate: (settings: VATSettings) => void;
}

export function StoreSettingsTab({ vatSettings, onVatSettingsUpdate }: StoreSettingsTabProps) {
  const organizationId = useOrganizationId();
  const [vatDialogOpen, setVatDialogOpen] = useState(false);
  const [showSampleDataConfirm, setShowSampleDataConfirm] = useState(false);
  const [newVatSettings, setNewVatSettings] = useState({
    rate: vatSettings?.rate || 15,
    isEnabled: vatSettings?.isEnabled ?? true
  });

  const handleUpdateVatSettings = async () => {
    if (!organizationId) return;

    const updatedVat: VATSettings = {
      id: 'vat',
      ...newVatSettings,
      organizationId,
      createdAt: vatSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'organizations', organizationId, 'settings', 'vat'), updatedVat);
    onVatSettingsUpdate(updatedVat);
    setVatDialogOpen(false);
  };

  const handleGenerateSampleData = () => {
    setShowSampleDataConfirm(true);
  };

  const confirmGenerateSampleData = async () => {
    if (!organizationId) return;
    
    try {
      const { generateSampleData } = await import('@/lib/sample-data-generator');
      await generateSampleData(organizationId!);
      toast.success('Sample data generated successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate sample data:', error);
      toast.error('Failed to generate sample data. Please try again.');
    } finally {
      setShowSampleDataConfirm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* VAT Settings */}
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

      {/* Sample Data Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sample Data
            </div>
            <Button onClick={handleGenerateSampleData} variant="outline">
              Generate Sample Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Generate comprehensive sample data to test the application:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Tables (5 tables with different capacities)</li>
              <li>Product categories (Food, Beverages, Desserts, etc.)</li>
              <li>Products (8 food and beverage items)</li>
              <li>Customers (5 sample customers)</li>
              <li>Suppliers (5 food and beverage suppliers)</li>
              <li>Orders (2 completed orders)</li>
              <li>Purchase invoices (2 supplier invoices)</li>
              <li>Sales invoices (2 customer invoices)</li>
            </ul>
            <p className="font-medium text-amber-600 mt-2">
              ⚠️ This will add data to your database. Make sure this is a test environment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Confirmation AlertDialog */}
      <AlertDialog open={showSampleDataConfirm} onOpenChange={setShowSampleDataConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Sample Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will populate your database with sample data including tables, products, customers, suppliers, orders, and invoices. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSampleDataConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGenerateSampleData} className="bg-destructive text-destructive-foreground">
              Generate Sample Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}