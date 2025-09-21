'use client';


import { useAuth } from '@/lib/hooks/useAuth';
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';

import { useTables } from '@/lib/hooks/useTables';
import { useSeparatedTemplates } from '@/lib/hooks/useSeparatedTemplates';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';




import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { Loader } from '@/components/ui/loader';
import { OrderTypesTab } from '@/components/settings/OrderTypesTab';
import { PaymentTypesTab } from '@/components/settings/PaymentTypesTab';
import { StoreSettingsTab } from '@/components/settings/StoreSettingsTab';
import { PrinterSettingsTab } from '@/components/settings/PrinterSettingsTab';
import { TemplatesTab } from '@/components/settings/TemplatesTab';
import { TablesTab } from '@/components/settings/TablesTab';
import { AdminOnlyGuard } from '@/components/layout/RoleGuard';

function SettingsContent() {
  const {} = useAuth();
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const { loading: receiptTemplatesLoading } = useSeparatedTemplates();
  const { tables, loading: tablesLoading } = useTables();

  const {
    storeSettings,
    loading: settingsLoading
  } = useStoreSettings();

  // Extract data from storeSettings
  const orderTypes = storeSettings?.orderTypes || [];
  const paymentTypes = storeSettings?.paymentTypes || [];

  


  // Debug logging
  console.log('SettingsPage Debug:', {
    organizationId,
    settingsLoading,
    receiptTemplatesLoading,
    tablesLoading,
    tablesLength: tables?.length
  });

  if (settingsLoading || receiptTemplatesLoading || tablesLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
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
          <StoreSettingsTab />
        </TabsContent>

        <TabsContent value="printer-settings" className="space-y-4">
          <PrinterSettingsTab
            printerSettings={storeSettings?.printerSettings}
            onPrinterSettingsUpdate={() => {}} // Will be handled internally
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
  return (
    <AdminOnlyGuard>
      <SettingsContent />
    </AdminOnlyGuard>
  );
}
