'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar } from 'lucide-react';

function ProfileContent() {
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);

  if (!user) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <User className="h-8 w-8" />
        Profile Settings
      </h1>

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
              <h3 className="text-lg font-semibold">{user?.email}</h3>
              <p className="text-muted-foreground">Account Information</p>
            </div>
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