'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar } from 'lucide-react';

interface AccountTabProps {
  userDisplayName: string;
  userEmail?: string | null;
  organizationCreatedAt?: Date;
}

export function AccountTab({
  userDisplayName,
  userEmail,
  organizationCreatedAt,
}: AccountTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{userDisplayName || userEmail}</h3>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userDisplayName">Display Name</Label>
            <Input
              id="userDisplayName"
              value={userDisplayName}
              disabled
              placeholder="Display name cannot be changed"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{userEmail}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {organizationCreatedAt?.toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
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
  );
}