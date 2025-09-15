'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganizationId, useUser, useSelectedOrganization } from '@/hooks/useAuthState';
import { Building2, Plus, Users, ArrowRight, Link } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface OrganizationSelectorProps {
  children: React.ReactNode;
}

export function OrganizationSelector({ children }: OrganizationSelectorProps) {
  const { user, organizationId, userOrganizations, selectedOrganization, selectOrganization, refreshUserOrganizations } = useAuthState();
  const [isOpen, setIsOpen] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationEmail, setNewOrganizationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleJoinOrganization = async () => {
    if (!joinCode || !user) return;
    
    setLoading(true);
    setJoinError('');
    try {
      // Find the invitation code
      const codesQuery = query(
        collection(db, 'invitationCodes'),
        where('code', '==', joinCode.toUpperCase()),
        where('isUsed', '==', false)
      );
      const codesSnapshot = await getDocs(codesQuery);
      
      if (codesSnapshot.empty) {
        setJoinError('Invalid or expired invitation code');
        return;
      }
      
      const invitationCode = codesSnapshot.docs[0].data();
      const codeId = codesSnapshot.docs[0].id;
      
      // Check if code is expired
      if (invitationCode.expiresAt.toDate() < new Date()) {
        setJoinError('Invitation code has expired');
        return;
      }
      
      // Check if user is already a member
      const existingMembershipQuery = query(
        collection(db, 'organizationUsers'),
        where('userId', '==', user.uid),
        where('organizationId', '==', invitationCode.organizationId)
      );
      const existingMembershipSnapshot = await getDocs(existingMembershipQuery);
      
      if (!existingMembershipSnapshot.empty) {
        setJoinError('You are already a member of this organization');
        return;
      }
      
      // Add user to organization
      await addDoc(collection(db, 'organizationUsers'), {
        userId: user.uid,
        organizationId: invitationCode.organizationId,
        role: invitationCode.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Mark invitation code as used
      await addDoc(collection(db, 'usedInvitationCodes'), {
        codeId,
        userId: user.uid,
        usedAt: serverTimestamp(),
      });
      
      // Refresh user organizations to include the new one
      await refreshUserOrganizations();
      
      // Switch to the new organization
      await selectOrganization(invitationCode.organizationId);
      
      setShowJoinForm(false);
      setJoinCode('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error joining organization:', error);
      setJoinError('Failed to join organization. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrganizationName || !newOrganizationEmail || !user) return;
    
    setLoading(true);
    try {
      // Create new organization
      const organizationRef = await addDoc(collection(db, 'organizations'), {
        name: newOrganizationName,
        email: newOrganizationEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscriptionStatus: 'trial',
      });
      
      // Add creator as admin
      await addDoc(collection(db, 'organizationUsers'), {
        userId: user.uid,
        organizationId: organizationRef.id,
        role: 'admin',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Refresh user organizations to include the new one
      await refreshUserOrganizations();
      
      // Switch to the new organization
      await selectOrganization(organizationRef.id);
      
      setShowCreateForm(false);
      setNewOrganizationName('');
      setNewOrganizationEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (organizationUserId: string) => {
    await selectOrganization(organizationUserId);
    setIsOpen(false);
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Organization</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Organization */}
          {selectedOrganization && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Building2 className="h-5 w-5" />
                  Current Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedOrganization.name}</h3>
                    <p className="text-sm text-gray-600">{selectedOrganization.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      {userOrganizations.find(ou => ou.organizationId === organizationId)?.role || 'User'}
                    </Badge>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Organizations */}
          {userOrganizations.filter(ou => ou.organizationId !== organizationId).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Organizations</h3>
              <div className="grid gap-4">
                {userOrganizations
                  .filter(ou => ou.organizationId !== organizationId)
                  .map((organizationUser) => (
                    <Card key={organizationUser.organizationId} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-gray-400" />
                            <div>
                              <h4 className="font-medium">Organization {organizationUser.organizationId.slice(-6)}</h4>
                              <Badge variant="outline" className="capitalize">
                                {organizationUser.role}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchOrganization(organizationUser.organizationId)}
                          >
                            Switch
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* Join/Create Options */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowJoinForm(true)}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Join Organization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Join an existing organization with an invitation code
                </p>
                <Button variant="outline" className="w-full">
                  Join Organization
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowCreateForm(true)}>
              <CardContent className="p-6 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Create Organization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new organization account
                </p>
                <Button variant="outline" className="w-full">
                  Create Organization
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Join Form */}
          {showJoinForm && (
            <Card>
              <CardHeader>
                <CardTitle>Join Existing Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="joinCode">Invitation Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="Enter invitation code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="font-mono uppercase"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Ask your organization admin for an invitation code
                  </p>
                  {joinError && (
                    <p className="text-sm text-red-600 mt-1">{joinError}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowJoinForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleJoinOrganization} 
                    disabled={!joinCode || loading}
                    className="flex-1"
                  >
                    {loading ? 'Joining...' : 'Join Organization'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    placeholder="Enter organization name"
                    value={newOrganizationName}
                    onChange={(e) => setNewOrganizationName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="organizationEmail">Organization Email</Label>
                  <Input
                    id="organizationEmail"
                    type="email"
                    placeholder="organization@example.com"
                    value={newOrganizationEmail}
                    onChange={(e) => setNewOrganizationEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateOrganization}
                    disabled={!newOrganizationName || !newOrganizationEmail || loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Organization'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}