'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { OrderType, PaymentType, VATSettings, PrinterSettings, ReceiptTemplate } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';

interface ConnectedPrinter {
  id: string;
  name: string;
  vendorId?: number;
  productId?: number;
  serialNumber?: string;
  usbVendorId?: number;
  usbProductId?: number;
}

interface ThermalPrinterService {
  getConnectedPrinters(): Promise<ConnectedPrinter[]>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  printTest(): Promise<void>;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Plus, Trash2, UtensilsCrossed, CreditCard, Percent, Printer, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function SettingsContent() {
  const { organizationId } = useAuth();
  const [orderTypes, setOrderTypes] = useState<OrderType[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [vatSettings, setVatSettings] = useState<VATSettings | null>(null);
   const [printerSettings, setPrinterSettings] = useState<PrinterSettings | null>(null);
   const [receiptTemplates, setReceiptTemplates] = useState<ReceiptTemplate[]>([]);
   const [connectedPrinters, setConnectedPrinters] = useState<ConnectedPrinter[]>([]);
   const [loading, setLoading] = useState(true);

  // Dialog states
  const [orderTypeDialogOpen, setOrderTypeDialogOpen] = useState(false);
  const [paymentTypeDialogOpen, setPaymentTypeDialogOpen] = useState(false);
  const [vatDialogOpen, setVatDialogOpen] = useState(false);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  // Form states
  const [newOrderType, setNewOrderType] = useState({ name: '', description: '' });
  const [newPaymentType, setNewPaymentType] = useState({ name: '', description: '' });
  const [newVatSettings, setNewVatSettings] = useState({ rate: 0, isEnabled: true });
   const [newPrinterSettings, setNewPrinterSettings] = useState({
     paperWidth: 58,
     fontSize: 'medium' as 'small' | 'medium' | 'large',
     autoCut: true,
     printerType: 'epson' as 'epson' | 'star',
     characterSet: 'korea',
     baudRate: 9600
   });
  const [newReceiptTemplate, setNewReceiptTemplate] = useState({ name: '', description: '', content: '', type: 'thermal' as 'thermal' | 'a4' });

  useEffect(() => {
    if (!organizationId) return;

    // Fetch order types
    const orderTypesQ = query(collection(db, 'tenants', organizationId, 'orderTypes'));
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
    const paymentTypesQ = query(collection(db, 'tenants', organizationId, 'paymentTypes'));
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
      const vatDoc = await getDoc(doc(db, 'tenants', organizationId, 'settings', 'vat'));
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
        await setDoc(doc(db, 'tenants', organizationId, 'settings', 'vat'), defaultVat);
        setVatSettings(defaultVat);
      }
    };

    fetchVatSettings();

    // Fetch connected printers
    const fetchConnectedPrinters = async () => {
      try {
        const printers = await (thermalPrinter as unknown as ThermalPrinterService).getConnectedPrinters();
        setConnectedPrinters(printers);
      } catch (error) {
        console.error('Failed to fetch connected printers:', error);
      }
    };

    fetchConnectedPrinters();

    // Fetch printer settings
    const fetchPrinterSettings = async () => {
      const printerDoc = await getDoc(doc(db, 'tenants', organizationId, 'settings', 'printer'));
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
          paperWidth: 58, // 58mm thermal printer
          fontSize: 'medium',
          characterPerLine: 32, // Approximate for 58mm paper
          autoCut: true,
          printerType: 'epson',
          characterSet: 'korea',
          baudRate: 9600,
          organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await setDoc(doc(db, 'tenants', organizationId, 'settings', 'printer'), defaultPrinter);
        setPrinterSettings(defaultPrinter);
      }
    };

    // Fetch receipt templates
    const templatesQ = query(collection(db, 'tenants', organizationId, 'receiptTemplates'));
    const templatesUnsubscribe = onSnapshot(templatesQ, (querySnapshot) => {
      const templatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as ReceiptTemplate[];
      setReceiptTemplates(templatesData);
    });

    fetchPrinterSettings();
    setLoading(false);

    return () => {
      orderTypesUnsubscribe();
      paymentTypesUnsubscribe();
      templatesUnsubscribe();
    };
  }, [organizationId]);

  const handleAddOrderType = async () => {
    if (!organizationId || !newOrderType.name.trim()) return;

    await addDoc(collection(db, 'tenants', organizationId, 'orderTypes'), {
      ...newOrderType,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewOrderType({ name: '', description: '' });
    setOrderTypeDialogOpen(false);
  };

  const handleAddPaymentType = async () => {
    if (!organizationId || !newPaymentType.name.trim()) return;

    await addDoc(collection(db, 'tenants', organizationId, 'paymentTypes'), {
      ...newPaymentType,
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewPaymentType({ name: '', description: '' });
    setPaymentTypeDialogOpen(false);
  };

  const handleUpdateVatSettings = async () => {
    if (!organizationId) return;

    const updatedVat: VATSettings = {
      id: 'vat',
      ...newVatSettings,
      organizationId,
      createdAt: vatSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'tenants', organizationId, 'settings', 'vat'), updatedVat);
    setVatSettings(updatedVat);
    setVatDialogOpen(false);
  };

  const handleDeleteOrderType = async (id: string) => {
    if (!organizationId) return;
    if (confirm('Are you sure you want to delete this order type?')) {
      await deleteDoc(doc(db, 'tenants', organizationId, 'orderTypes', id));
    }
  };

  const handleDeletePaymentType = async (id: string) => {
    if (!organizationId) return;
    if (confirm('Are you sure you want to delete this payment type?')) {
      await deleteDoc(doc(db, 'tenants', organizationId, 'paymentTypes', id));
    }
  };

  const handleUpdatePrinterSettings = async () => {
    if (!organizationId) return;

    const calculateCharactersPerLine = (width: number) => {
      // Approximate characters per line based on paper width in mm
      if (width <= 48) return 24;
      if (width <= 58) return 32;
      if (width <= 80) return 48;
      return 64;
    };

    const updatedPrinter: PrinterSettings = {
      id: 'printer',
      ...newPrinterSettings,
      characterPerLine: calculateCharactersPerLine(newPrinterSettings.paperWidth),
      organizationId,
      createdAt: printerSettings?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'tenants', organizationId, 'settings', 'printer'), updatedPrinter);
    setPrinterSettings(updatedPrinter);
    setPrinterDialogOpen(false);
  };

  const handleAddReceiptTemplate = async () => {
    if (!organizationId || !newReceiptTemplate.name.trim()) return;

    const defaultTemplateContent = '<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset="utf-8">\\n  <title>Receipt</title>\\n  <style>\\n    body { font-family: monospace; margin: 0; padding: 10px; }\\n    .header { text-align: center; margin-bottom: 10px; }\\n    .content { margin-bottom: 10px; }\\n    .footer { text-align: center; margin-top: 10px; }\\n    .line { display: flex; justify-content: space-between; }\\n    .total { font-weight: bold; border-top: 1px dashed; padding-top: 5px; }\\n  </style>\\n</head>\\n<body>\\n  <div class="header">\\n    <h2>{{companyName}}</h2>\\n    <p>{{companyAddress}}</p>\\n    <p>Tel: {{companyPhone}}</p>\\n    <p>VAT: {{companyVat}}</p>\\n    <hr>\\n    <p>Order #: {{orderNumber}}</p>\\n    <p>Date: {{orderDate}}</p>\\n    <p>Table: {{tableName}}</p>\\n    <p>Customer: {{customerName}}</p>\\n    <hr>\\n  </div>\\n  \\n  <div class="content">\\n    {{#each items}}\\n    <div class="line">\\n      <span>{{name}} ({{quantity}}x)</span>\\n      <span>{{total}}</span>\\n    </div>\\n    {{/each}}\\n  </div>\\n  \\n  <div class="total">\\n    <div class="line">\\n      <span>Subtotal:</span>\\n      <span>{{subtotal}}</span>\\n    </div>\\n    <div class="line">\\n      <span>VAT ({{vatRate}}%):</span>\\n      <span>{{vatAmount}}</span>\\n    </div>\\n    <div class="line">\\n      <span>TOTAL:</span>\\n      <span>{{total}}</span>\\n    </div>\\n  </div>\\n  \\n  <div class="footer">\\n    <p>Payment: {{paymentMethod}}</p>\\n    <p>Thank you for your business!</p>\\n  </div>\\n</body>\\n</html>';

    await addDoc(collection(db, 'tenants', organizationId, 'receiptTemplates'), {
      ...newReceiptTemplate,
      content: newReceiptTemplate.content || defaultTemplateContent,
      isDefault: receiptTemplates.length === 0, // First template is default
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    setNewReceiptTemplate({ name: '', description: '', content: '', type: 'thermal' });
    setTemplateDialogOpen(false);
  };

  const handleSetDefaultTemplate = async (templateId: string) => {
    if (!organizationId) return;

    // Update all templates to set isDefault: false
    const updatePromises = receiptTemplates.map(template => {
      const templateRef = doc(db, 'tenants', organizationId, 'receiptTemplates', template.id);
      return setDoc(templateRef, { 
        ...template, 
        isDefault: template.id === templateId,
        updatedAt: new Date()
      });
    });

    await Promise.all(updatePromises);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!organizationId) return;
    if (confirm('Are you sure you want to delete this receipt template?')) {
      await deleteDoc(doc(db, 'tenants', organizationId, 'receiptTemplates', id));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Store Settings</h1>
      </div>

      <Tabs defaultValue="order-types" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
           <TabsTrigger value="order-types">Order Types</TabsTrigger>
           <TabsTrigger value="payment-types">Payment Types</TabsTrigger>
           <TabsTrigger value="store-settings">Store Settings</TabsTrigger>
           <TabsTrigger value="printer-settings">Printer</TabsTrigger>
           <TabsTrigger value="receipt-templates">Receipts</TabsTrigger>
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

         <TabsContent value="store-settings" className="space-y-4">
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

           <Card>
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <FileText className="h-5 w-5" />
                   Sample Data
                 </div>
                 <Button
                   onClick={async () => {
                     if (confirm('This will populate your database with sample data. This action cannot be undone. Continue?')) {
                       try {
                         // Import sample data generation function
                         const { generateSampleData } = await import('@/lib/sample-data-generator');
                         await generateSampleData(organizationId!);
                         alert('Sample data generated successfully!');
                         // Refresh the page to show new data
                         window.location.reload();
                       } catch (error) {
                         console.error('Failed to generate sample data:', error);
                         alert('Failed to generate sample data. Please try again.');
                       }
                     }
                   }}
                   variant="outline"
                 >
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
         </TabsContent>

        <TabsContent value="printer-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Printer Settings
                </div>
                <Dialog open={printerDialogOpen} onOpenChange={setPrinterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Printer
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Printer Settings</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="paper-width">Paper Width (mm)</Label>
                        <select
                          id="paper-width"
                          className="w-full p-2 border rounded"
                          value={newPrinterSettings.paperWidth}
                          onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, paperWidth: parseInt(e.target.value) })}
                        >
                          <option value={48}>48mm</option>
                          <option value={58}>58mm</option>
                          <option value={80}>80mm</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="font-size">Font Size</Label>
                        <select
                          id="font-size"
                          className="w-full p-2 border rounded"
                          value={newPrinterSettings.fontSize}
                          onChange={(e) => {
                          const value = e.target.value as 'small' | 'medium' | 'large';
                          setNewPrinterSettings({ ...newPrinterSettings, fontSize: value });
                        }}
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                       <div className="flex items-center space-x-2">
                         <Switch
                           id="auto-cut"
                           checked={newPrinterSettings.autoCut}
                           onCheckedChange={(checked) => setNewPrinterSettings({ ...newPrinterSettings, autoCut: checked })}
                         />
                         <Label htmlFor="auto-cut">Auto Cut (if supported)</Label>
                       </div>
                       <div>
                         <Label htmlFor="printer-type">Printer Type</Label>
                         <select
                           id="printer-type"
                           className="w-full p-2 border rounded"
                           value={newPrinterSettings.printerType}
                           onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, printerType: e.target.value as 'epson' | 'star' })}
                         >
                           <option value="epson">Epson</option>
                           <option value="star">Star</option>
                         </select>
                       </div>
                       <div>
                         <Label htmlFor="character-set">Character Set</Label>
                         <select
                           id="character-set"
                           className="w-full p-2 border rounded"
                           value={newPrinterSettings.characterSet}
                           onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, characterSet: e.target.value })}
                         >
                           <option value="korea">Korea</option>
                           <option value="japan">Japan</option>
                           <option value="multilingual">Multilingual</option>
                           <option value="usa">USA</option>
                         </select>
                       </div>
                       <div>
                         <Label htmlFor="baud-rate">Baud Rate</Label>
                         <select
                           id="baud-rate"
                           className="w-full p-2 border rounded"
                           value={newPrinterSettings.baudRate}
                           onChange={(e) => setNewPrinterSettings({ ...newPrinterSettings, baudRate: parseInt(e.target.value) })}
                         >
                           <option value={9600}>9600</option>
                           <option value={19200}>19200</option>
                           <option value={38400}>38400</option>
                           <option value={115200}>115200</option>
                         </select>
                       </div>
                      <Button onClick={handleUpdatePrinterSettings} className="w-full">
                        Update Settings
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
             <CardContent>
               {printerSettings ? (
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <span>Paper Width:</span>
                     <span className="font-medium">{printerSettings.paperWidth}mm</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Font Size:</span>
                     <span className="font-medium">{printerSettings.fontSize}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Characters per Line:</span>
                     <span className="font-medium">{printerSettings.characterPerLine}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Auto Cut:</span>
                     <Badge variant={printerSettings.autoCut ? "default" : "secondary"}>
                       {printerSettings.autoCut ? "Enabled" : "Disabled"}
                     </Badge>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Printer Type:</span>
                     <span className="font-medium">{printerSettings.printerType || 'epson'}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Character Set:</span>
                     <span className="font-medium">{printerSettings.characterSet || 'korea'}</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <span>Baud Rate:</span>
                     <span className="font-medium">{printerSettings.baudRate || 9600}</span>
                   </div>

                   {/* Connected Printers Section */}
                   <div className="border-t pt-4">
                     <div className="flex items-center justify-between mb-2">
                       <span className="font-medium">Connected Printers:</span>
                       <Button
                         size="sm"
                         variant="outline"
                         onClick={async () => {
                           try {
                                     const printers = await (thermalPrinter as unknown as ThermalPrinterService).getConnectedPrinters();
                             setConnectedPrinters(printers);
                           } catch (error) {
                             console.error('Failed to refresh printers:', error);
                           }
                         }}
                       >
                         Refresh
                       </Button>
                     </div>
                     {connectedPrinters.length > 0 ? (
                       <div className="space-y-2">
                         {connectedPrinters.map((printer) => (
                           <div key={printer.id} className="flex items-center justify-between p-2 border rounded">
                             <div>
                               <span className="font-medium">{printer.name}</span>
                               {printer.vendorId && (
                                 <div className="text-sm text-muted-foreground">
                                   Vendor: 0x{printer.vendorId.toString(16)}, Product: 0x{printer.productId?.toString(16)}
                                 </div>
                               )}
                             </div>
                             <div className="flex gap-2">
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={async () => {
                                   try {
                                     await thermalPrinter.connect();
                                     alert('Printer connected successfully!');
                                     // Refresh the list
                             const printers = await (thermalPrinter as unknown as ThermalPrinterService).getConnectedPrinters();
                                     setConnectedPrinters(printers);
                                   } catch (error) {
                                     alert('Failed to connect to printer');
                                   }
                                 }}
                               >
                                 Connect
                               </Button>
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={async () => {
                                   try {
                                     await (thermalPrinter as unknown as ThermalPrinterService).printTest();
                                     alert('Test print sent!');
                                   } catch (error) {
                                     alert('Failed to print test');
                                   }
                                 }}
                               >
                                 Test Print
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <p className="text-sm text-muted-foreground">
                         No printers detected. Connect a thermal printer and click &quot;Refresh&quot;.
                       </p>
                     )}
                      {(thermalPrinter as unknown as ThermalPrinterService).isConnected() && (
                       <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                         <div className="flex items-center gap-2 text-green-700">
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                           <span className="text-sm font-medium">Printer Connected</span>
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
               ) : (
                 <p className="text-muted-foreground">Printer settings not configured.</p>
               )}
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt-templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Receipt Templates
                </div>
                <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add Receipt Template</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                          id="template-name"
                          placeholder="e.g., Thermal Receipt, A4 Receipt"
                          value={newReceiptTemplate.name}
                          onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-description">Description (Optional)</Label>
                        <Input
                          id="template-description"
                          placeholder="Description for this template"
                          value={newReceiptTemplate.description}
                          onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="template-type">Template Type</Label>
                        <select
                          id="template-type"
                          className="w-full p-2 border rounded"
                          value={newReceiptTemplate.type}
                          onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, type: e.target.value as 'thermal' | 'a4' })}
                        >
                          <option value="thermal">Thermal Printer</option>
                          <option value="a4">A4 Printer</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="template-content">HTML Template Content</Label>
                        <textarea
                          id="template-content"
                          className="w-full h-64 p-2 border rounded font-mono text-sm"
                          placeholder="Enter HTML template with placeholders like {{companyName}}, {{orderNumber}}, etc."
                          value={newReceiptTemplate.content}
                          onChange={(e) => setNewReceiptTemplate({ ...newReceiptTemplate, content: e.target.value })}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Available placeholders: {'{{companyName}}'}, {'{{companyAddress}}'}, {'{{companyPhone}}'}, {'{{companyVat}}'}, {'{{orderNumber}}'}, {'{{orderDate}}'}, {'{{tableName}}'}, {'{{customerName}}'}, {'{{#each items}}...{{/each}}'}, {'{{subtotal}}'}, {'{{vatRate}}'}, {'{{vatAmount}}'}, {'{{total}}'}, {'{{paymentMethod}}'}
                        </p>
                      </div>
                      <Button onClick={handleAddReceiptTemplate} className="w-full">
                        Add Template
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receiptTemplates.length === 0 ? (
                <p className="text-muted-foreground">No receipt templates added yet.</p>
              ) : (
                <div className="grid gap-2">
                  {receiptTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{template.name}</h3>
                          {template.isDefault && <Badge variant="default">Default</Badge>}
                          <Badge variant="outline">{template.type}</Badge>
                        </div>
                        {template.description && (
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!template.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetDefaultTemplate(template.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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