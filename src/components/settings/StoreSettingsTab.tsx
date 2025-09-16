'use client';

import { useState } from 'react';
import { useOrganizationId } from '@/legacy_hooks/useAuthState';
import { useSettingsData } from '@/legacy_hooks/organization/use-settings-data';
import { VATSettings } from '@/types';
import { useCurrencySettings } from '@/legacy_hooks/useCurrencySettings';
import { Currency, CurrencyLocale } from '@/types/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableSetting } from '@/components/ui/editable-setting';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Percent, FileText, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface StoreSettingsTabProps {
  vatSettings: VATSettings | null;
  onVatSettingsUpdate: (settings: VATSettings) => void;
}

export function StoreSettingsTab({ vatSettings, onVatSettingsUpdate }: StoreSettingsTabProps) {
  const organizationId = useOrganizationId();
  const { currencySettings, updateCurrencySettings } = useCurrencySettings();
  const { handleVatSettingsUpdate } = useSettingsData(organizationId || undefined);
  const [showSampleDataConfirm, setShowSampleDataConfirm] = useState(false);

  const handleUpdateVatSettings = async (field: keyof VATSettings, value: string | number | boolean) => {
    if (!organizationId || !vatSettings) return;

    const updatedVat: VATSettings = {
      ...vatSettings,
      [field]: value,
      updatedAt: new Date(),
    };

    handleVatSettingsUpdate(updatedVat);
    onVatSettingsUpdate(updatedVat);
  };

  const getCurrencyFromLocale = (locale: CurrencyLocale): Currency => {
    const currencyMap: Record<CurrencyLocale, Currency> = {
      [CurrencyLocale.AR_SA]: Currency.SAR,
      [CurrencyLocale.EN_US]: Currency.USD,
      [CurrencyLocale.EN_GB]: Currency.GBP,
      [CurrencyLocale.DE_DE]: Currency.EUR,
      [CurrencyLocale.FR_FR]: Currency.EUR,
      [CurrencyLocale.AR_AE]: Currency.AED,
      [CurrencyLocale.AR_KW]: Currency.KWD,
      [CurrencyLocale.AR_BH]: Currency.BHD,
      [CurrencyLocale.AR_OM]: Currency.OMR,
      [CurrencyLocale.AR_QA]: Currency.QAR,
    };
    return currencyMap[locale] || Currency.SAR;
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
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            VAT Settings
            <span className="text-sm text-muted-foreground">(Double-click to edit)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vatSettings ? (
            <div className="space-y-4">
              <EditableSetting
                label="VAT Status"
                value={vatSettings.isEnabled}
                type="switch"
                onSave={(value) => handleUpdateVatSettings('isEnabled', value)}
              />
              {vatSettings.isEnabled && (
                <EditableSetting
                  label="VAT Rate"
                  value={vatSettings.rate}
                  type="number"
                  onSave={(value) => handleUpdateVatSettings('rate', value)}
                  placeholder="15"
                />
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">VAT settings not configured.</p>
          )}
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currency Settings
            <span className="text-sm text-muted-foreground">(Double-click to edit)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currencySettings ? (
            <div className="space-y-4">
              <EditableSetting
                label="Currency Format"
                value={currencySettings.locale}
                type="select"
                options={[
                  { value: CurrencyLocale.AR_SA, label: 'Arabic (SAR)' },
                  { value: CurrencyLocale.EN_US, label: 'English (USD)' },
                  { value: CurrencyLocale.EN_GB, label: 'English (GBP)' },
                  { value: CurrencyLocale.DE_DE, label: 'German (EUR)' },
                  { value: CurrencyLocale.FR_FR, label: 'French (EUR)' },
                  { value: CurrencyLocale.AR_AE, label: 'Arabic UAE (AED)' },
                  { value: CurrencyLocale.AR_KW, label: 'Arabic Kuwait (KWD)' },
                  { value: CurrencyLocale.AR_BH, label: 'Arabic Bahrain (BHD)' },
                  { value: CurrencyLocale.AR_OM, label: 'Arabic Oman (OMR)' },
                  { value: CurrencyLocale.AR_QA, label: 'Arabic Qatar (QAR)' },
                ]}
                onSave={(value: CurrencyLocale) => updateCurrencySettings({ locale: value, currency: getCurrencyFromLocale(value) })}
              />
            </div>
          ) : (
            <p className="text-muted-foreground">Currency settings not configured.</p>
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