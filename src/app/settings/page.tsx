'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOrganization } from '@/lib/hooks/useOrganization';

import { useRealtimeCollection } from '@/lib/hooks/useRealtimeCollection';
import { useTables } from '@/lib/hooks/useTables';
import { useTemplatesData } from '@/legacy_hooks/use-templates-data';
import { TemplateCategory } from '@/types/template';
import { PaymentType, OrderType } from '@/types';
import { useSettingsData } from '@/legacy_hooks/organization/use-settings-data';

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
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const { data: paymentTypes, loading: paymentTypesLoading } = useRealtimeCollection<PaymentType>('paymentTypes', organizationId || null);
  const { templates: receiptTemplates, loading: receiptTemplatesLoading } = useTemplatesData(organizationId || undefined, TemplateCategory.RECEIPT);
  const { data: orderTypes, loading: orderTypesLoading } = useRealtimeCollection<OrderType>('orderTypes', organizationId || null);
  const { tables, loading: tablesLoading } = useTables();
  const { 
    vatSettings, 
    printerSettings, 
    loading: settingsLoading,
    handleVatSettingsUpdate,
    handlePrinterSettingsUpdate 
  } = useSettingsData(organizationId || undefined);

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
            orderTypes={orderTypes}
          />
        </TabsContent>

        <TabsContent value="payment-types" className="space-y-4">
          <PaymentTypesTab
            paymentTypes={paymentTypes}
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TablesTab
            tables={tables}
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
          <TemplatesTab
            receiptTemplates={receiptTemplates}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}