'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Tenant } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, User, Mail, Calendar, Upload, X } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function CompanyContent() {
  const { user, tenantId } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [stampUrl, setStampUrl] = useState('');

  useEffect(() => {
    if (!tenantId) return;

    const fetchTenant = async () => {
      const tenantDoc = await getDoc(doc(db, 'tenants', tenantId));
      if (tenantDoc.exists()) {
        const tenantData = {
          id: tenantDoc.id,
          ...tenantDoc.data(),
          createdAt: tenantDoc.data().createdAt?.toDate(),
        } as Tenant;

        setTenant(tenantData);
        setCompanyName(tenantData.name || '');
        setCompanyNameAr(tenantData.nameAr || '');
        setCompanyEmail(tenantData.email || '');
        setCompanyAddress(tenantData.address || '');
        setCompanyPhone(tenantData.phone || '');
        setVatNumber(tenantData.vatNumber || '');
        setLogoUrl(tenantData.logoUrl || '');
        setStampUrl(tenantData.stampUrl || '');
      }
      setLoading(false);
    };

    fetchTenant();
  }, [tenantId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !tenantId) return;
    
    const file = e.target.files[0];
    setUploadingLogo(true);
    
    try {
      const storageRef = ref(storage, `tenants/${tenantId}/logo`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      setLogoUrl(downloadUrl);
      
      // Update tenant document
      await updateDoc(doc(db, 'tenants', tenantId), {
        logoUrl: downloadUrl,
        updatedAt: new Date(),
      });
      
      // Update local state
      setTenant(prev => prev ? { ...prev, logoUrl: downloadUrl } : null);
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !tenantId) return;
    
    const file = e.target.files[0];
    setUploadingStamp(true);
    
    try {
      const storageRef = ref(storage, `tenants/${tenantId}/stamp`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      setStampUrl(downloadUrl);
      
      // Update tenant document
      await updateDoc(doc(db, 'tenants', tenantId), {
        stampUrl: downloadUrl,
        updatedAt: new Date(),
      });
      
      // Update local state
      setTenant(prev => prev ? { ...prev, stampUrl: downloadUrl } : null);
    } catch (error) {
      console.error('Error uploading stamp:', error);
      alert('Failed to upload stamp.');
    } finally {
      setUploadingStamp(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!tenantId) return;
    
    try {
      await updateDoc(doc(db, 'tenants', tenantId), {
        logoUrl: '',
        updatedAt: new Date(),
      });
      
      setLogoUrl('');
      setTenant(prev => prev ? { ...prev, logoUrl: '' } : null);
    } catch (error) {
      console.error('Error removing logo:', error);
      alert('Failed to remove logo.');
    }
  };

  const handleRemoveStamp = async () => {
    if (!tenantId) return;
    
    try {
      await updateDoc(doc(db, 'tenants', tenantId), {
        stampUrl: '',
        updatedAt: new Date(),
      });
      
      setStampUrl('');
      setTenant(prev => prev ? { ...prev, stampUrl: '' } : null);
    } catch (error) {
      console.error('Error removing stamp:', error);
      alert('Failed to remove stamp.');
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!tenantId) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'tenants', tenantId), {
        name: companyName,
        nameAr: companyNameAr,
        email: companyEmail,
        address: companyAddress,
        phone: companyPhone,
        vatNumber: vatNumber,
        logoUrl: logoUrl,
        stampUrl: stampUrl,
        updatedAt: new Date(),
      });

      // Update local state
      setTenant(prev => prev ? {
        ...prev,
        name: companyName,
        nameAr: companyNameAr,
        email: companyEmail,
        address: companyAddress,
        phone: companyPhone,
        vatNumber: vatNumber,
        logoUrl: logoUrl,
        stampUrl: stampUrl,
      } : null);

      alert('Company information updated successfully!');
    } catch (error) {
      console.error('Error updating company info:', error);
      alert('Failed to update company information.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Company & Account</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="account">Account Details</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name (English)</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNameAr">Company Name (Arabic)</Label>
                  <Input
                    id="companyNameAr"
                    value={companyNameAr}
                    onChange={(e) => setCompanyNameAr(e.target.value)}
                    placeholder="Enter company name in Arabic"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Company Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="Enter company email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Input
                  id="companyAddress"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Enter company address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input
                    id="companyPhone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="Enter VAT number"
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo} loading={saving}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Company Logo</Label>
                <div className="flex items-center space-x-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img 
                        src={logoUrl} 
                        alt="Company Logo" 
                        className="w-24 h-24 object-contain border rounded"
                      />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Logo</span>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" loading={uploadingLogo}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: Square image, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Company Stamp</Label>
                <div className="flex items-center space-x-4">
                  {stampUrl ? (
                    <div className="relative">
                      <img 
                        src={stampUrl} 
                        alt="Company Stamp" 
                        className="w-24 h-24 object-contain border rounded"
                      />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={handleRemoveStamp}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Stamp</span>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="stamp-upload" className="cursor-pointer">
                      <Button variant="outline" loading={uploadingStamp}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Stamp
                      </Button>
                    </Label>
                    <Input
                      id="stamp-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleStampUpload}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Recommended: Transparent PNG, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo} loading={saving}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <p className="text-muted-foreground">Professional Plan</p>
                </div>
                <Badge variant={tenant?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {tenant?.subscriptionStatus || 'Unknown'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Invoices</Label>
                  <p className="text-2xl font-bold">Unlimited</p>
                </div>
                <div>
                  <Label>Storage</Label>
                  <p className="text-2xl font-bold">10GB</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user.displayName || user.email}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {tenant?.createdAt?.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Two-Factor Authentication
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CompanyPage() {
  return <CompanyContent />;
}