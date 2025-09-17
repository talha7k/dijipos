'use client';

import { useState, useEffect } from 'react';

import { useAtomValue } from 'jotai';
import { useAuth } from '@/lib/hooks/useAuth';
import { selectedOrganizationAtom, organizationUsersAtom,  } from '@/atoms/organizationAtoms';
import { organizationLoadingAtom } from '@/atoms';
import { useInvitationCodesData, useInvitationCodesActions } from '@/lib/hooks/useInvitationCodes';
import { updateOrganization, updateOrganizationBranding, updateOrganizationUser, updateUserStatus } from '@/lib/firebase/firestore/organizations';
import { Organization, OrganizationUser, InvitationCode } from '@/types';
import { UserRole } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, CreditCard, User, Mail, Calendar, X, Users, Plus, Edit, Trash2, Shield, Settings, Copy, Link } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';



function CompanyContent() {
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationUsers = useAtomValue(organizationUsersAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom);
  const organizationId = selectedOrganization?.id;
  const organization = selectedOrganization;
  const { invitationCodes, loading: codesLoading, error: codesError } = useInvitationCodesData(organizationId || undefined);
  const { createInvitationCodeSimple, deleteInvitationCode } = useInvitationCodesActions(organizationId || undefined);
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

      toast.success('Company information updated successfully!');
    } catch (error) {
      console.error('Error updating company info:', error);
      toast.error('Failed to update company information.');
    } finally {
      setSaving(false);
    }
  };

  // Team management functions
  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateInvitationCode = async () => {
    if (!organizationId) return;

    try {
      await createInvitationCodeSimple(invitationFormData.role, invitationFormData.expiresAt);

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

    try {
      await updateOrganizationUser(editingUser.id, {
        role: formData.role === 'admin' ? UserRole.ADMIN :
              formData.role === 'manager' ? UserRole.MANAGER :
              formData.role === 'waiter' ? UserRole.WAITER : UserRole.CASHIER,
        isActive: formData.isActive,
      });

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
    try {
      await updateUserStatus(userId, isActive);
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

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
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
                  <ImageUpload
                    value={logoUrl}
                    onChange={(url) => setLogoUrl(url || '')}
                    path={`organizations/${organizationId}`}
                    placeholder="Upload company logo"
                    maxSize={2}
                  />
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
                  <ImageUpload
                    value={stampUrl}
                    onChange={(url) => setStampUrl(url || '')}
                    path={`organizations/${organizationId}`}
                    placeholder="Upload company stamp"
                    maxSize={2}
                  />
                </div>
              </div>

              <Button onClick={handleSaveCompanyInfo} loading={saving}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Team Management</h2>
            <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Invitation Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Invitation Code</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="role">Role</Label>
                   <Select value={invitationFormData.role} onValueChange={(value: string) => setInvitationFormData({ ...invitationFormData, role: value as UserRole })}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select role" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                       <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                       <SelectItem value={UserRole.WAITER}>Waiter</SelectItem>
                       <SelectItem value={UserRole.CASHIER}>Cashier</SelectItem>
                     </SelectContent>
                   </Select>
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={invitationFormData.expiresAt.toISOString().slice(0, 16)}
                      onChange={(e) => setInvitationFormData({ ...invitationFormData, expiresAt: new Date(e.target.value) })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setInvitationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateInvitationCode}>
                      Generate Code
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Invitation Codes Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invitation Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitationCodes.map((invitationCode) => {
                    const RoleIcon = getRoleIcon(invitationCode.role);
                    
                    return (
                      <TableRow key={invitationCode.id}>
                        <TableCell className="font-medium font-mono">{invitationCode.code}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(invitationCode.role)} className="capitalize">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {invitationCode.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{invitationCode.expiresAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={invitationCode.isUsed ? 'secondary' : 'default'}>
                            {invitationCode.isUsed ? 'Used' : 'Available'}
                          </Badge>
                        </TableCell>
                        <TableCell>{invitationCode.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyInvitationCode(invitationCode.code)}
                              disabled={invitationCode.isUsed}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={invitationCode.isUsed}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Invitation Code</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this invitation code? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteInvitationCode(invitationCode.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {invitationCodes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <Link className="h-12 w-12 mb-4 text-gray-400" />
                          <p>No invitation codes found. Generate your first invitation code to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Organization Users Section */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizationUsers.map((organizationUser) => {
                    const RoleIcon = getRoleIcon(organizationUser.role);
                    
                    return (
                      <TableRow key={organizationUser.id}>
                        <TableCell className="font-medium">{organizationUser.userId}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(organizationUser.role)} className="capitalize">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {organizationUser.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={organizationUser.isActive ? 'default' : 'secondary'}>
                            {organizationUser.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{organizationUser.createdAt?.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(organizationUser)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Switch
                              checked={organizationUser.isActive}
                              onCheckedChange={() => handleToggleUserStatus(organizationUser.id, organizationUser.isActive)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {organizationUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <Users className="h-12 w-12 mb-4 text-gray-400" />
                          <p>No team members found. Users will appear here when they join using invitation codes.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit User Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                   <Select value={formData.role} onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select role" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                       <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                       <SelectItem value={UserRole.WAITER}>Waiter</SelectItem>
                       <SelectItem value={UserRole.CASHIER}>Cashier</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active User</Label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateUser}>
                    Update User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <span>Joined {organization?.createdAt?.toLocaleDateString()}</span>
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