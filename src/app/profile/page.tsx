'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { updateProfile } from 'firebase/auth';
import { updateUser } from '@/lib/firebase/firestore/users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

function ProfileContent() {
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const [userDisplayName, setUserDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setUserDisplayName(user.displayName || '');
  }, [user]);

  const handleUpdateUserDisplayName = async () => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: userDisplayName });

      // Also update the user profile in Firestore
      await updateUser(user.uid, { name: userDisplayName });

      toast.success('Display name updated successfully!');
    } catch (error) {
      console.error('Error updating display name:', error);
      toast.error('Failed to update display name.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <User className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Profile Settings</h1>
      </div>

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
              <h3 className="text-lg font-semibold">{userDisplayName || user?.email}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="userDisplayName">Display Name</Label>
              <Input
                id="userDisplayName"
                value={userDisplayName}
                onChange={(e) => setUserDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="w-full"
              />
            </div>
            <Button onClick={handleUpdateUserDisplayName} loading={saving}>
              Update Display Name
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {selectedOrganization?.createdAt?.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Two-Factor Authentication
            </Button>
            <Button variant="destructive" className="w-full justify-start col-span-2">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}