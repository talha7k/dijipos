'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms/organizationAtoms';

import { useTables } from '@/lib/hooks/useTables';
import { useTemplates } from '@/lib/hooks/useTemplates';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';
import { useOrderTypes } from '@/lib/hooks/useOrderTypes';
import { usePaymentTypes } from '@/lib/hooks/usePaymentTypes';
import { TemplateCategory, VATSettings, PrinterSettings } from '@/types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { OrderTypesTab } from '@/components/settings/OrderTypesTab';
import { PaymentTypesTab } from '@/components/settings/PaymentTypesTab';
import { StoreSettingsTab } from '@/components/settings/StoreSettingsTab';
import { PrinterSettingsTab } from '@/components/settings/PrinterSettingsTab';
import { TemplatesTab } from '@/components/settings/TemplatesTab';
import { TablesTab } from '@/components/settings/TablesTab';

function SettingsContent() {
  const { user } = useAuth();
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypes();
  const { receiptTemplates, loading: receiptTemplatesLoading } = useTemplates();
  const { orderTypes, loading: orderTypesLoading } = useOrderTypes();
  const { tables, loading: tablesLoading } = useTables();
  const {
    storeSettings,
    loading: settingsLoading
  } = useStoreSettings();

  // Extract data from storeSettings
  const vatSettings = storeSettings?.vatSettings || null;
  const handleVatSettingsUpdate = (settings: VATSettings) => {
    // TODO: implement update
    console.log('Update VAT settings:', settings);
  };
  const printerSettings = null; // TODO: get from separate hook
  const handlePrinterSettingsUpdate = (settings: PrinterSettings) => {
    // TODO: implement update
    console.log('Update printer settings:', settings);
  };

  // Debug logging
  console.log('SettingsPage Debug:', {
    organizationId,
    settingsLoading,
    paymentTypesLoading,
    receiptTemplatesLoading,
    orderTypesLoading,
    tablesLoading,
    tablesLength: tables?.length
  });

  if (settingsLoading || paymentTypesLoading || receiptTemplatesLoading || orderTypesLoading || tablesLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <SettingsHeader />

      <Tabs defaultValue="order-types" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="order-types">Order Types</TabsTrigger>
          <TabsTrigger value="payment-types">Payment Types</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="store-settings">Store Settings</TabsTrigger>
          <TabsTrigger value="printer-settings">Printer</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="order-types" className="space-y-4">
          <OrderTypesTab
            orderTypes={orderTypes || []}
          />
        </TabsContent>

        <TabsContent value="payment-types" className="space-y-4">
          <PaymentTypesTab
            paymentTypes={paymentTypes || []}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TablesTab
            tables={tables || []}
          />
        </TabsContent>

        <TabsContent value="store-settings" className="space-y-4">
          <StoreSettingsTab
            vatSettings={vatSettings}
            onVatSettingsUpdate={handleVatSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value="printer-settings" className="space-y-4">
          <PrinterSettingsTab
            printerSettings={printerSettings}
            onPrinterSettingsUpdate={handlePrinterSettingsUpdate}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}
