'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { useAtomValue } from 'jotai';
import { useAuth } from '@/lib/hooks/useAuth';
import { selectedOrganizationAtom, organizationUsersAtom,  } from '@/atoms';
import { organizationLoadingAtom } from '@/atoms';
import { useInvitationCodesData, useInvitationCodesActions } from '@/lib/hooks/useInvitationCodes';
import { updateOrganization, updateOrganizationBranding, updateOrganizationUser, updateUserStatus } from '@/lib/firebase/firestore/organizations';
import { updateUser } from '@/lib/firebase/firestore/users';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAtom } from 'jotai';
import { selectedOrganizationIdAtom } from '@/atoms';
import { OrganizationUser } from '@/types';
import { UserRole } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, X, Users, Plus, Edit, Trash2, Shield, Settings, Copy, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';
import { DatePicker } from '@/components/ui/date-picker';
import { CompanyInfoTab } from '@/components/company/CompanyInfoTab';
import { BrandingTab } from '@/components/company/BrandingTab';
import { TeamTab } from '@/components/company/TeamTab';
import { AccountTab } from '@/components/company/AccountTab';
import { AdminOnlyGuard } from '@/components/layout/RoleGuard';



function CompanyContent() {
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationUsers = useAtomValue(organizationUsersAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom);
  const [selectedOrganizationId, setSelectedOrganizationId] = useAtom(selectedOrganizationIdAtom);
  const organizationId = selectedOrganization?.id;
  const organization = selectedOrganization;
  const { invitationCodes, loading: codesLoading, refetch: refetchInvitationCodes } = useInvitationCodesData(organizationId || undefined);
  const { createInvitationCodeSimple, deleteInvitationCode } = useInvitationCodesActions(organizationId || undefined, refetchInvitationCodes);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OrganizationUser | null>(null);
  const [formData, setFormData] = useState({
    role: UserRole.WAITER,
    isActive: true,
  });
  const [invitationFormData, setInvitationFormData] = useState({
    role: UserRole.WAITER,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const [activeTab, setActiveTab] = useState('company');

  // Handle URL hash for tab navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['company', 'branding', 'team', 'subscription'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

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
    if (!organization) return;

    setCompanyName(organization.name || '');
    setCompanyNameAr(organization.nameAr || '');
    setCompanyEmail(organization.email || '');
    setCompanyAddress(organization.address || '');
    setCompanyPhone(organization.phone || '');
    setVatNumber(organization.vatNumber || '');
    setLogoUrl(organization.logoUrl || '');
    setStampUrl(organization.stampUrl || '');
  }, [organization]);

  useEffect(() => {
    const isLoading = orgLoading || codesLoading;
    setLoading(isLoading);
  }, [orgLoading, codesLoading]);



  

  const handleRemoveLogo = async () => {
    if (!organizationId) return;

    try {
      await updateOrganizationBranding(organizationId, '', stampUrl);
      setLogoUrl('');
      // Refresh organization data
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Failed to remove logo.');
    }
  };

  const handleRemoveStamp = async () => {
    if (!organizationId) return;

    try {
      await updateOrganizationBranding(organizationId, logoUrl, '');
      setStampUrl('');
      // Refresh organization data
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);
    } catch (error) {
      console.error('Error removing stamp:', error);
      toast.error('Failed to remove stamp.');
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!organizationId) return;

    setSaving(true);
    try {
      await updateOrganization(organizationId, {
        name: companyName,
        nameAr: companyNameAr,
        email: companyEmail,
        address: companyAddress,
        phone: companyPhone,
        vatNumber: vatNumber,
        logoUrl: logoUrl,
        stampUrl: stampUrl,
      });

      // Refresh organization data to reflect changes
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);

      toast.success('Company information updated successfully!');
    } catch (error) {
      console.error('Error updating company info:', error);
      toast.error('Failed to update company information.');
    } finally {
      setSaving(false);
    }
  };



  const handleCreateInvitationCode = async () => {
    if (!organizationId) return;

    console.log('handleCreateInvitationCode: Creating invitation code with role', invitationFormData.role);

    try {
      await createInvitationCodeSimple(invitationFormData.role, invitationFormData.expiresAt);
      console.log('handleCreateInvitationCode: Successfully created invitation code');

      setInvitationDialogOpen(false);
      setInvitationFormData({
        role: UserRole.WAITER,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error('Error creating invitation code:', error);
      toast.error('Failed to create invitation code. Please try again.');
    }
  };

  const handleDeleteInvitationCode = async (codeId: string) => {
    if (!organizationId) return;

    try {
      await deleteInvitationCode(codeId);
    } catch (error) {
      console.error('Error deleting invitation code:', error);
      toast.error('Failed to delete invitation code. Please try again.');
    }
  };

  const handleCopyInvitationCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Invitation code copied to clipboard!');
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error('Failed to copy code to clipboard.');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !organizationId) return;

    console.log('handleUpdateUser: Updating user', editingUser.id, 'with role', formData.role, 'and status', formData.isActive);

    try {
      await updateOrganizationUser(editingUser.id, {
        role: formData.role === 'admin' ? UserRole.ADMIN :
              formData.role === 'manager' ? UserRole.MANAGER :
              formData.role === 'waiter' ? UserRole.WAITER : UserRole.CASHIER,
        isActive: formData.isActive,
      });

      console.log('handleUpdateUser: Successfully updated user in database');
      setDialogOpen(false);
      setEditingUser(null);
      setFormData({
        role: UserRole.WAITER,
        isActive: true,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user. Please try again.');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    console.log('handleToggleUserStatus: Toggling user', userId, 'to status', isActive);

    try {
      await updateUserStatus(userId, isActive);
      console.log('handleToggleUserStatus: Successfully updated user status in database');
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status. Please try again.');
    }
  };



  const openEditDialog = (organizationUser: OrganizationUser) => {
    setEditingUser(organizationUser);
    setFormData({
      role: organizationUser.role,
      isActive: organizationUser.isActive,
    });
    setDialogOpen(true);
  };

  const getRoleBadgeColor = (role: OrganizationUser['role']) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'waiter':
        return 'outline';
      case 'cashier':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: OrganizationUser['role']) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'manager':
        return Settings;
      default:
        return Users;
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

       <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
         <TabsList className="grid w-full grid-cols-4">
           <TabsTrigger value="company">Company Info</TabsTrigger>
           <TabsTrigger value="branding">Branding</TabsTrigger>
           <TabsTrigger value="team">Team</TabsTrigger>
           <TabsTrigger value="subscription">Subscription</TabsTrigger>
         </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfoTab
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyNameAr={companyNameAr}
            setCompanyNameAr={setCompanyNameAr}
            companyEmail={companyEmail}
            setCompanyEmail={setCompanyEmail}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyPhone={companyPhone}
            setCompanyPhone={setCompanyPhone}
            vatNumber={vatNumber}
            setVatNumber={setVatNumber}
            handleSaveCompanyInfo={handleSaveCompanyInfo}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <BrandingTab
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            stampUrl={stampUrl}
            setStampUrl={setStampUrl}
            handleRemoveLogo={handleRemoveLogo}
            handleRemoveStamp={handleRemoveStamp}
            handleSaveCompanyInfo={handleSaveCompanyInfo}
            saving={saving}
            organizationId={organizationId}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTab
            invitationCodes={invitationCodes}
            organizationUsers={organizationUsers}
            handleCreateInvitationCode={handleCreateInvitationCode}
            handleDeleteInvitationCode={handleDeleteInvitationCode}
            handleCopyInvitationCode={handleCopyInvitationCode}
            handleUpdateUser={handleUpdateUser}
            handleToggleUserStatus={handleToggleUserStatus}
            openEditDialog={openEditDialog}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            formData={formData}
            setFormData={setFormData}
            invitationFormData={invitationFormData}
            setInvitationFormData={setInvitationFormData}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            invitationDialogOpen={invitationDialogOpen}
            setInvitationDialogOpen={setInvitationDialogOpen}
          />
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
                <Badge variant={organization?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                  {organization?.subscriptionStatus || 'Unknown'}
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


      </Tabs>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <AdminOnlyGuard>
      <CompanyContent />
    </AdminOnlyGuard>
  );
}