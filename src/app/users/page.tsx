'use client';

import { useState } from 'react';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/legacy_hooks/useAuthState';
import { useOrganizationUsersData } from '@/legacy_hooks/organization/use-organization-users-data';
import { useInvitationCodesData } from '@/legacy_hooks/organization/use-invitation-codes-data';
import { useOrganizationUsersActions } from '@/legacy_hooks/organization/use-organization-users-actions';
import { useInvitationCodesActions } from '@/legacy_hooks/organization/use-invitation-codes-actions';
import { OrganizationUser, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Trash2, Shield, Settings, Copy, Link } from 'lucide-react';
import { toast } from 'sonner';

function UsersContent() {
  const organizationId = useOrganizationId();

  const { organizationUsers, loading: usersLoading } = useOrganizationUsersData(organizationId || undefined);
  const { invitationCodes, loading: codesLoading } = useInvitationCodesData(organizationId || undefined);
  const { updateUser, toggleUserStatus } = useOrganizationUsersActions(organizationId || undefined);
  const { createInvitationCode, deleteInvitationCode } = useInvitationCodesActions(organizationId || undefined);
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

  const loading = usersLoading || codesLoading;

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
      const code = generateInvitationCode();
      await createInvitationCode({
        code,
        role: invitationFormData.role,
        expiresAt: invitationFormData.expiresAt,
      });

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
      await updateUser(editingUser.id, formData);

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

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!organizationId) return;

    try {
      await toggleUserStatus(userId, currentStatus);
    } catch (error) {
      console.error('Error toggling user status:', error);
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

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex space-x-2">
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
          <CardTitle>Organization Users</CardTitle>
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
                      <p>No users found. Users will appear here when they join using invitation codes.</p>
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
    </div>
  );
}

export default function UsersPage() {
  return <UsersContent />;
}