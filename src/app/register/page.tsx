'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function RegisterContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create tenant document
      const tenantId = user.uid;
      await setDoc(doc(db, 'tenants', tenantId), {
        id: tenantId,
        name: tenantName,
        email: email,
        createdAt: new Date(),
        subscriptionStatus: 'trial',
        emailVerified: false,
      });

      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true,
      });

      // Show success toast
      toast.success('Registration Successful!', {
        description: 'Please check your email to verify your account before logging in.',
      });

      // Sign out the user and redirect to verification pending page
      await auth.signOut();
      router.push('/login?verification=true');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      // Handle specific Firebase auth errors
      if (err instanceof Error) {
        if (err.message.includes('email-already-in-use')) {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.message.includes('invalid-email')) {
          setError('Please enter a valid email address.');
        } else if (err.message.includes('operation-not-allowed')) {
          setError('Email/password accounts are not enabled. Please contact support.');
        } else if (err.message.includes('weak-password')) {
          setError('Password is too weak. Please use a stronger password.');
        } else {
          setError('Registration failed: ' + err.message);
        }
      } else {
        setError('Registration failed: Unknown error');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="tenantName">Organization Name</Label>
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" loading={isLoading}>
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <a href="/login" className="text-sm text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterContent />;
}