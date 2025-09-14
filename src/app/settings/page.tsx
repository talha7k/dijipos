'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

import { usePaymentTypesData } from '@/hooks/use-payment-types-data';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';
import { useOrderTypesData } from '@/hooks/use-order-types-data';
import { useTablesData } from '@/hooks/use-tables-data';
import { VATSettings, PrinterSettings, FontSize, PrinterType } from '@/types';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from '@/components/settings/SettingsHeader';
import { OrderTypesTab } from '@/components/settings/OrderTypesTab';
import { PaymentTypesTab } from '@/components/settings/PaymentTypesTab';
import { StoreSettingsTab } from '@/components/settings/StoreSettingsTab';
import { PrinterSettingsTab } from '@/components/settings/PrinterSettingsTab';
import { ReceiptTemplatesTab } from '@/components/settings/ReceiptTemplatesTab';
import { TablesTab } from '@/components/settings/TablesTab';

function SettingsContent() {
  const { organizationId } = useAuth();
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypesData(organizationId || undefined);
  const { receiptTemplates, loading: receiptTemplatesLoading } = useReceiptTemplatesData(organizationId || undefined);
  const { orderTypes, loading: orderTypesLoading } = useOrderTypesData(organizationId || undefined);
  const { tables, loading: tablesLoading } = useTablesData(organizationId || undefined);
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
  const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) return;

    // Fetch VAT settings
    const fetchVatSettings = async () => {
      const vatDoc = await getDoc(doc(db, 'organizations', organizationId, 'settings', 'vat'));
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
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'organizations', organizationId, 'settings', 'vat'), defaultVat);
        setVatSettings(defaultVat);
      }
    };

    // Fetch printer settings
    const fetchPrinterSettings = async () => {
      const printerDoc = await getDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'));
      if (printerDoc.exists()) {
        const printerData = printerDoc.data() as PrinterSettings;
        setPrinterSettings({
          ...printerData,
          createdAt: printerData.createdAt,
          updatedAt: printerData.updatedAt,
        });
      } else {
        // Create default printer settings
        const defaultPrinter: PrinterSettings = {
          id: 'printer',
          paperWidth: 58,
          fontSize: FontSize.MEDIUM,
          characterPerLine: 32,
          autoCut: true,
          printerType: PrinterType.EPSON,
          characterSet: 'korea',
          baudRate: 9600,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'organizations', organizationId, 'settings', 'printer'), defaultPrinter);
        setPrinterSettings(defaultPrinter);
      }
    };

    const loadData = async () => {
      await Promise.all([fetchVatSettings(), fetchPrinterSettings()]);
      setLoading(false);
    };

    loadData();
  }, [organizationId]);

  const handleVatSettingsUpdate = (settings: VATSettings) => {
    setVatSettings(settings);
  };

  const handlePrinterSettingsUpdate = (settings: PrinterSettings) => {
    setPrinterSettings(settings);
  };

  if (loading || paymentTypesLoading || receiptTemplatesLoading || orderTypesLoading || tablesLoading) {
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