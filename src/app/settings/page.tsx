'use client';

import { useState } from 'react';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';

import { usePaymentTypesData } from '@/hooks/uePaymentTypes';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';
import { useOrders } from '@/hooks/orders/useOrders';
import { useTablesData } from '@/hooks/tables/useTables';
import { useSettingsData } from '@/hooks/organization/use-settings-data';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { OrderTypesTab } from '@/components/settings/OrderTypesTab';
import { PaymentTypesTab } from '@/components/settings/PaymentTypesTab';
import { StoreSettingsTab } from '@/components/settings/StoreSettingsTab';
import { PrinterSettingsTab } from '@/components/settings/PrinterSettingsTab';
import { ReceiptTemplatesTab } from '@/components/settings/ReceiptTemplatesTab';
import { TablesTab } from '@/components/settings/TablesTab';

function SettingsContent() {
  const organizationId = useOrganizationId();
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypesData(organizationId || undefined);
  const { receiptTemplates, loading: receiptTemplatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const { orderTypes, loading: orderTypesLoading } = useOrders(organizationId || undefined);
  const { tables, loading: tablesLoading } = useTablesData(organizationId || undefined);
  const { 
    vatSettings, 
    printerSettings, 
    loading: settingsLoading,
    handleVatSettingsUpdate,
    handlePrinterSettingsUpdate 
  } = useSettingsData(organizationId || undefined);

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
          <TabsTrigger value="receipt-templates">Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="order-types" className="space-y-4">
          <OrderTypesTab
            orderTypes={orderTypes}
            onRefresh={() => {}} // Real-time updates via onSnapshot
          />
        </TabsContent>

        <TabsContent value="payment-types" className="space-y-4">
          <PaymentTypesTab
            paymentTypes={paymentTypes}
            onRefresh={() => {}} // Real-time updates via onSnapshot
          />
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <TablesTab
            tables={tables}
            onRefresh={() => {}} // Real-time updates via onSnapshot
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

        <TabsContent value="receipt-templates" className="space-y-4">
          <ReceiptTemplatesTab
            receiptTemplates={receiptTemplates}
            onRefresh={() => {}} // Real-time updates via onSnapshot
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}