'use client';

import { useState } from 'react';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';
import { VATSettings, CurrencySettings } from '@/types';
import { Currency, CurrencyLocale } from '@/types/enums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EditableSetting } from '@/components/ui/editable-setting';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Percent, FileText, DollarSign, Database } from 'lucide-react';
import { toast } from 'sonner';
import { updateVATSettings, updateCurrencySettings, createVATSettings, createCurrencySettings } from '@/lib/firebase/firestore/settings/storeSettings';

export function StoreSettingsTab() {
  const { storeSettings } = useStoreSettings();
  const [showSampleDataConfirm, setShowSampleDataConfirm] = useState(false);

  // Default VAT settings
  const defaultVatSettings: VATSettings = {
    id: 'default',
    rate: 15,
    isEnabled: true,
    isVatInclusive: false,
    organizationId: storeSettings?.organizationId || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Default currency settings
  const defaultCurrencySettings: CurrencySettings = {
    id: 'default',
    locale: CurrencyLocale.AR_SA,
    currency: Currency.SAR,
    organizationId: storeSettings?.organizationId || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const handleUpdateVatSettings = async (field: keyof VATSettings, value: string | number | boolean) => {
    if (!storeSettings?.organizationId) return;

    try {
      const currentVatSettings = storeSettings.vatSettings || defaultVatSettings;

      if (!storeSettings.vatSettings) {
        // Create new VAT settings if they don't exist
        const vatSettingsId = await createVATSettings({
          organizationId: storeSettings.organizationId,
          rate: defaultVatSettings.rate,
          isEnabled: defaultVatSettings.isEnabled,
          isVatInclusive: defaultVatSettings.isVatInclusive,
        });

        // Update store settings to include the new VAT settings ID
        if (storeSettings.id) {
          await updateVATSettings(vatSettingsId, { [field]: value });
        }
      } else {
        // Update existing VAT settings
        await updateVATSettings(currentVatSettings.id, { [field]: value });
      }

      toast.success('VAT settings updated successfully!');
    } catch (error) {
      console.error('Error updating VAT settings:', error);
      toast.error('Failed to update VAT settings. Please try again.');
    }
  };

  const handleUpdateCurrencySettings = async (value: CurrencyLocale) => {
    if (!storeSettings?.organizationId) return;

    try {
      const currency = getCurrencyFromLocale(value);

      if (!storeSettings.currencySettings) {
        // Create new currency settings if they don't exist
        await createCurrencySettings({
          organizationId: storeSettings.organizationId,
          locale: value,
          currency: currency,
        });
      } else {
        // Update existing currency settings
        await updateCurrencySettings(storeSettings.currencySettings.id, {
          locale: value,
          currency: currency,
        });
      }

      toast.success('Currency settings updated successfully!');
    } catch (error) {
      console.error('Error updating currency settings:', error);
      toast.error('Failed to update currency settings. Please try again.');
    }
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
    if (!storeSettings?.organizationId) return;

    try {
      const { generateSampleData } = await import('@/lib/sample-data-generator');
      await generateSampleData(storeSettings.organizationId);
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
    <>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <div className="space-y-4">
              <EditableSetting
                label="VAT Status"
                value={storeSettings?.vatSettings?.isEnabled ?? defaultVatSettings.isEnabled}
                type="switch"
                onSave={(value) => handleUpdateVatSettings('isEnabled', value)}
              />
              {(storeSettings?.vatSettings?.isEnabled ?? defaultVatSettings.isEnabled) && (
                <>
                  <EditableSetting
                    label="VAT Inclusive Pricing"
                    value={storeSettings?.vatSettings?.isVatInclusive ?? defaultVatSettings.isVatInclusive}
                    type="switch"
                    onSave={(value) => handleUpdateVatSettings('isVatInclusive', value)}
                  />
                  <EditableSetting
                    label="VAT Rate"
                    value={storeSettings?.vatSettings?.rate ?? defaultVatSettings.rate}
                    type="number"
                    onSave={(value) => handleUpdateVatSettings('rate', value)}
                    placeholder="15"
                  />
                </>
              )}
            </div>
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
            <div className="space-y-4">
              <EditableSetting
                label="Currency Format"
                value={storeSettings?.currencySettings?.locale ?? defaultCurrencySettings.locale}
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
                onSave={handleUpdateCurrencySettings}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sample Data
            </div>
            <Button onClick={handleGenerateSampleData}>
              Generate Sample Data
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>



      {/* Sample Data Confirmation AlertDialog */}
      <AlertDialog open={showSampleDataConfirm} onOpenChange={setShowSampleDataConfirm}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Sample Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will populate your database with comprehensive sample data to test the application. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>The following sample data will be generated:</p>
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSampleDataConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGenerateSampleData} className="bg-destructive text-destructive-foreground">
              Generate Sample Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
