'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Receipt, Palette, Bell } from 'lucide-react';

interface AppSettings {
  defaultVatRate: number;
  defaultCurrency: string;
  defaultLanguage: string;
  defaultTemplate: 'english' | 'arabic';
  includeQRByDefault: boolean;
  autoSaveDrafts: boolean;
  emailNotifications: boolean;
  invoicePrefix: string;
  quotePrefix: string;
}

const currencies = [
  { value: 'SAR', label: 'Saudi Riyal (SAR)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
];

export default function SettingsPage() {
  const { user, tenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    defaultVatRate: 15,
    defaultCurrency: 'SAR',
    defaultLanguage: 'en',
    defaultTemplate: 'english',
    includeQRByDefault: false,
    autoSaveDrafts: true,
    emailNotifications: true,
    invoicePrefix: 'INV-',
    quotePrefix: 'QUO-',
  });

  useEffect(() => {
    if (!tenantId) return;

    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'tenants', tenantId, 'settings', 'app'));
        if (settingsDoc.exists()) {
          setSettings(prev => ({
            ...prev,
            ...settingsDoc.data(),
          } as AppSettings));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [tenantId]);

  const handleSaveSettings = async () => {
    if (!tenantId) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', tenantId, 'settings', 'app'), {
        ...settings,
        updatedAt: new Date(),
      });

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!user) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="invoice" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invoice">Invoice Defaults</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Invoice Default Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vatRate">Default VAT Rate (%)</Label>
                  <Input
                    id="vatRate"
                    type="number"
                    step="0.01"
                    value={settings.defaultVatRate}
                    onChange={(e) => updateSetting('defaultVatRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={settings.defaultCurrency}
                    onValueChange={(value) => updateSetting('defaultCurrency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Default Language</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => updateSetting('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Default Template</Label>
                  <Select
                    value={settings.defaultTemplate}
                    onValueChange={(value) => updateSetting('defaultTemplate', value as 'english' | 'arabic')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={(e) => updateSetting('invoicePrefix', e.target.value)}
                    placeholder="INV-"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotePrefix">Quote Number Prefix</Label>
                  <Input
                    id="quotePrefix"
                    value={settings.quotePrefix}
                    onChange={(e) => updateSetting('quotePrefix', e.target.value)}
                    placeholder="QUO-"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeQR"
                  checked={settings.includeQRByDefault}
                  onCheckedChange={(checked) => updateSetting('includeQRByDefault', checked)}
                />
                <Label htmlFor="includeQR">Include ZATCA QR code by default</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Theme settings will be available in a future update.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={settings.defaultLanguage}
                  onValueChange={(value) => updateSetting('defaultLanguage', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value}>
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
                <Label htmlFor="emailNotifications">Email notifications for new invoices</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSave"
                  checked={settings.autoSaveDrafts}
                  onCheckedChange={(checked) => updateSetting('autoSaveDrafts', checked)}
                />
                <Label htmlFor="autoSave">Auto-save drafts</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Export Data</Label>
                <p className="text-sm text-muted-foreground">
                  Export all your data for backup purposes.
                </p>
                <Button variant="outline">Export Data</Button>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-muted-foreground">
                  These actions cannot be undone.
                </p>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Reset All Settings
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Delete All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}