'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Plus, Users, ArrowRight, Crown, Settings, Trash2, Shield, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

export function OrganizationManager() {
  const { user, organizationId, userOrganizations, selectOrganization, refreshUserOrganizations } = useAuth();
  const { theme } = useTheme();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newOrganizationName, setNewOrganizationName] = useState('');
  const [newOrganizationEmail, setNewOrganizationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [organizations, setOrganizations] = useState<{ [key: string]: Organization }>({});
  
  const isDark = theme === 'dark';

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
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'} flex items-center justify-center p-4`}>
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
              <Building2 className="h-12 w-12 text-white" />
            </div>
            <h1 className={`text-5xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>DijiPOS</h1>
          </div>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your organizations with ease</p>
        </div>

        <div className="space-y-12">
          {/* Existing Organizations */}
          {userOrganizations.length > 0 && (
            <div>
              <div className="flex items-center justify-center mb-8">
                <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Organizations</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userOrganizations.map((organizationUser) => {
                  const org = organizations[organizationUser.organizationId];
                  const isSelected = organizationId === organizationUser.organizationId;
                  return (
                    <Card 
                      key={organizationUser.organizationId} 
                      className={`group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        isSelected 
                          ? (isDark ? 'border-purple-500 bg-purple-500/10' : 'border-blue-500 bg-blue-50') 
                          : (isDark ? 'border-gray-700 bg-gray-800/50 hover:border-purple-400' : 'border-gray-200 bg-white hover:border-blue-300')
                      }`}
                      onClick={() => handleSwitchOrganization(organizationUser.organizationId)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                          {/* Organization Icon */}
                          <div className={`p-4 rounded-full ${
                            isSelected 
                              ? (isDark ? 'bg-purple-600' : 'bg-blue-600')
                              : (isDark ? 'bg-gray-700' : 'bg-gray-100')
                          }`}>
                            <Building2 className={`h-8 w-8 ${isSelected ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-600')}`} />
                          </div>
                          
                          {/* Organization Info */}
                          <div className="space-y-2">
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {org?.name || `Organization ${organizationUser.organizationId.slice(-6)}`}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                              <Mail className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                {org?.email || 'No email'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Role Badge */}
                          <div className="flex items-center gap-2">
                            {organizationUser.role === 'admin' && (
                              <div className="flex items-center gap-1">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                <span className="text-xs text-yellow-600 font-medium">Admin</span>
                              </div>
                            )}
                            <Badge 
                              variant={isSelected ? "default" : "secondary"} 
                              className={`capitalize text-xs ${
                                isSelected 
                                  ? (isDark ? 'bg-purple-600' : 'bg-blue-600')
                                  : (isDark ? 'bg-gray-700' : 'bg-gray-200')
                              }`}
                            >
                              {organizationUser.role}
                            </Badge>
                          </div>
                          
                          {/* Enter Button */}
                          <Button 
                            className={`w-full mt-4 transition-all duration-200 ${
                              isSelected 
                                ? (isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700')
                                : (isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300')
                            }`}
                            size="sm"
                          >
                            {isSelected ? 'Current' : 'Enter'}
                            {!isSelected && <ArrowRight className="h-4 w-4 ml-2" />}
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
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Join Organization */}
            <Card className={`transition-all duration-300 hover:shadow-2xl ${
              isDark 
                ? 'border-gray-700 bg-gray-800/50 hover:border-blue-400' 
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ${
                    isDark ? 'bg-blue-600/20' : 'bg-blue-100'
                  }`}>
                    <Users className={`h-10 w-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Join Organization</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Connect with an existing organization using an invitation code
                    </p>
                  </div>
                  
                  {!showJoinForm ? (
                    <Button 
                      onClick={() => setShowJoinForm(true)}
                      variant="outline" 
                      className={`w-full py-3 text-lg font-medium transition-all duration-200 ${
                        isDark 
                          ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' 
                          : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Join with Code
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinCode" className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Invitation Code
                        </Label>
                        <Input
                          id="joinCode"
                          placeholder="Enter invitation code"
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                          className={`font-mono uppercase text-center text-lg py-3 ${
                            isDark ? 'bg-gray-800 border-gray-700 text-white' : ''
                          }`}
                        />
                        {joinError && (
                          <p className="text-sm text-red-500 mt-2">{joinError}</p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowJoinForm(false);
                            setJoinCode('');
                            setJoinError('');
                          }}
                          className={`flex-1 py-3 ${
                            isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : ''
                          }`}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleJoinOrganization} 
                          disabled={!joinCode || loading}
                          className={`flex-1 py-3 font-medium ${
                            isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {loading ? 'Joining...' : 'Join Now'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Create Organization */}
            <Card className={`transition-all duration-300 hover:shadow-2xl ${
              isDark 
                ? 'border-gray-700 bg-gray-800/50 hover:border-green-400' 
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ${
                    isDark ? 'bg-green-600/20' : 'bg-green-100'
                  }`}>
                    <Plus className={`h-10 w-10 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Organization</h3>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Start fresh by creating your own organization
                    </p>
                  </div>
                  
                  {!showCreateForm ? (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      variant="outline" 
                      className={`w-full py-3 text-lg font-medium transition-all duration-200 ${
                        isDark 
                          ? 'border-green-500 text-green-400 hover:bg-green-500/10' 
                          : 'border-green-300 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      Create New
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="organizationName" className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Organization Name
                        </Label>
                        <Input
                          id="organizationName"
                          placeholder="Enter organization name"
                          value={newOrganizationName}
                          onChange={(e) => setNewOrganizationName(e.target.value)}
                          className={`py-3 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizationEmail" className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Organization Email
                        </Label>
                        <Input
                          id="organizationEmail"
                          type="email"
                          placeholder="organization@example.com"
                          value={newOrganizationEmail}
                          onChange={(e) => setNewOrganizationEmail(e.target.value)}
                          className={`py-3 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewOrganizationName('');
                            setNewOrganizationEmail('');
                          }}
                          className={`flex-1 py-3 ${
                            isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : ''
                          }`}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateOrganization}
                          disabled={!newOrganizationName || !newOrganizationEmail || loading}
                          className={`flex-1 py-3 font-medium ${
                            isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {loading ? 'Creating...' : 'Create Now'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}