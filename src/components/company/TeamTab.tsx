'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Copy, Users, Link } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { OrganizationUser } from '@/types';
import { UserRole } from '@/types/enums';

interface InvitationCode {
  id: string;
  code: string;
  role: UserRole;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

interface TeamTabProps {
  invitationCodes: InvitationCode[];
  organizationUsers: OrganizationUser[];
  handleCreateInvitationCode: () => void;
  handleDeleteInvitationCode: (codeId: string) => void;
  handleCopyInvitationCode: (code: string) => void;
  handleUpdateUser: () => void;
  handleToggleUserStatus: (userId: string, isActive: boolean) => void;
  openEditDialog: (organizationUser: OrganizationUser) => void;
  editingUser: OrganizationUser | null;
  setEditingUser: (user: OrganizationUser | null) => void;
  formData: {
    role: UserRole;
    isActive: boolean;
  };
  setFormData: (data: { role: UserRole; isActive: boolean }) => void;
  invitationFormData: {
    role: UserRole;
    expiresAt: Date;
  };
  setInvitationFormData: (data: { role: UserRole; expiresAt: Date }) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  invitationDialogOpen: boolean;
  setInvitationDialogOpen: (open: boolean) => void;
}

export function TeamTab({
  invitationCodes,
  organizationUsers,
  handleCreateInvitationCode,
  handleDeleteInvitationCode,
  handleCopyInvitationCode,
  handleUpdateUser,
  handleToggleUserStatus,
  openEditDialog,
  formData,
  setFormData,
  invitationFormData,
  setInvitationFormData,
  dialogOpen,
  setDialogOpen,
  invitationDialogOpen,
  setInvitationDialogOpen,
}: TeamTabProps) {
  // Debug logging
  console.log('TeamTab: Received', organizationUsers.length, 'users and', invitationCodes.length, 'invitation codes');

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
        return 'Shield';
      case 'manager':
        return 'Settings';
      default:
        return 'Users';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Team Management</h2>
        <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Invitation Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Generate Invitation Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={invitationFormData.role}
                    onValueChange={(value: string) => setInvitationFormData({ ...invitationFormData, role: value as UserRole })}
                  >
                    <SelectTrigger className="w-full">
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
                <DatePicker
                  label="Expires At"
                  value={invitationFormData.expiresAt}
                  onChange={(date) =>
                    setInvitationFormData({
                      ...invitationFormData,
                      expiresAt: date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    })
                  }
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
                        {RoleIcon === 'Shield' && '🛡️'}
                        {RoleIcon === 'Settings' && '⚙️'}
                        {RoleIcon === 'Users' && '👥'}
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
                        {RoleIcon === 'Shield' && '🛡️'}
                        {RoleIcon === 'Settings' && '⚙️'}
                        {RoleIcon === 'Users' && '👥'}
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
              <Select
                value={formData.role}
                onValueChange={(value: string) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="w-full">
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