'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Plus, Users, ArrowRight, Crown, Settings, Trash2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

export function OrganizationManager() {
  const { user, organizationId, userOrganizations, selectOrganization, refreshUserOrganizations } = useAuth();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationEmail, setNewOrganizationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [organizations, setOrganizations] = useState<{ [key: string]: Organization }>({});

  // Fetch organization details for all user organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      const orgData: { [key: string]: Organization } = {};
      
      for (const userOrg of userOrganizations) {
        try {
          const orgDoc = await getDoc(doc(db, 'organizations', userOrg.organizationId));
          if (orgDoc.exists()) {
            orgData[userOrg.organizationId] = {
              id: orgDoc.id,
              ...orgDoc.data(),
              createdAt: orgDoc.data().createdAt?.toDate(),
              updatedAt: orgDoc.data().updatedAt?.toDate(),
            } as Organization;
          }
        } catch (error) {
          console.error('Error fetching organization:', error);
        }
      }
      
      setOrganizations(orgData);
    };

    if (userOrganizations.length > 0) {
      fetchOrganizations();
    }
  }, [userOrganizations]);

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
    } catch (error) {
      console.error('Error creating organization:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (organizationUserId: string) => {
    await selectOrganization(organizationUserId);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">DijiPOS</h1>
          </div>
          <p className="text-xl text-gray-600">Select or manage your organizations</p>
        </div>

        <div className="space-y-8">
          {/* Existing Organizations */}
          {userOrganizations.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-center">Your Organizations</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userOrganizations.map((organizationUser) => {
                  const org = organizations[organizationUser.organizationId];
                  return (
                    <Card key={organizationUser.organizationId} className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-10 w-10 text-blue-600" />
                            <div>
                              <h3 className="font-semibold text-lg">
                                {org?.name || `Organization ${organizationUser.organizationId.slice(-6)}`}
                              </h3>
                              <p className="text-sm text-gray-600">{org?.email}</p>
                            </div>
                          </div>
                          {organizationUser.role === 'admin' && (
                            <div className="flex items-center gap-1">
                              <Crown className="h-5 w-5 text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">Owner</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize">
                            {organizationUser.role}
                          </Badge>
                          <Button
                            onClick={() => handleSwitchOrganization(organizationUser.organizationId)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Enter
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Join/Create Options */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Join Organization */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-8 text-center">
                <Users className="h-16 w-16 mx-auto mb-6 text-blue-600" />
                <h3 className="text-xl font-semibold mb-4">Join Organization</h3>
                <p className="text-gray-600 mb-6">
                  Join an existing organization with an invitation code
                </p>
                
                {!showJoinForm ? (
                  <Button 
                    onClick={() => setShowJoinForm(true)}
                    variant="outline" 
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Join Organization
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="joinCode">Invitation Code</Label>
                      <Input
                        id="joinCode"
                        placeholder="Enter invitation code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        className="font-mono uppercase text-center"
                      />
                      {joinError && (
                        <p className="text-sm text-red-600 mt-2">{joinError}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowJoinForm(false);
                          setJoinCode('');
                          setJoinError('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleJoinOrganization} 
                        disabled={!joinCode || loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Create Organization */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
              <CardContent className="p-8 text-center">
                <Plus className="h-16 w-16 mx-auto mb-6 text-green-600" />
                <h3 className="text-xl font-semibold mb-4">Create Organization</h3>
                <p className="text-gray-600 mb-6">
                  Create a new organization and become its admin
                </p>
                
                {!showCreateForm ? (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    variant="outline" 
                    className="w-full border-green-300 text-green-600 hover:bg-green-50"
                  >
                    Create Organization
                  </Button>
                ) : (
                  <div className="space-y-4">
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
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewOrganizationName('');
                          setNewOrganizationEmail('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateOrganization}
                        disabled={!newOrganizationName || !newOrganizationEmail || loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {loading ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}