'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { user, loading, error, emailVerified } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo as Route);
    } else if (!loading && user && !emailVerified) {
      toast.error('Email Verification Required', {
        description: 'Please check your email and click the verification link to access your account.',
        action: {
          label: 'Go to Login',
          onClick: () => router.push('/login?verification=true'),
        },
      });
      router.push('/login?verification=true');
    }
  }, [user, loading, emailVerified, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in the useEffect
  }

  if (!emailVerified) {
    return null; // Will redirect in the useEffect
  }

  return <>{children}</>;
}