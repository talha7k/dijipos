'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { applyActionCode, checkActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Suspense } from 'react';
import { toast } from 'sonner';

function HomeContent() {
  const { user, loading, emailVerified } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);



  // Handle authentication-based routing
  // Only redirect if we're not processing an action code
  useEffect(() => {
    if (loading || resetMode || isProcessing) return; // Wait for auth to finish loading or action processing

    if (user && emailVerified) {
      router.push('/select-organization');
    } else if (user && !emailVerified) {
      router.push('/login?verification=true');
    } else if (!user) {
      router.push('/login');
    }
  }, [loading, user, emailVerified, router, resetMode, isProcessing]);

  // Handle Firebase action codes (email verification, password reset)
  // These are links that Firebase redirects to the root URL
  useEffect(() => {
    const checkForActionCode = async () => {
      // Check if there's an action code in the URL
      const oobCode = searchParams.get('oobCode');
      const mode = searchParams.get('mode');

      if (!oobCode || !mode) {
        // No action code, let the auth routing handle it
        return;
      }

      console.log('HomeContent: Processing action code, mode:', mode);
      setIsProcessing(true);

      try {
        if (mode === 'verifyEmail') {
          // Handle email verification
          await checkActionCode(auth, oobCode);
          await applyActionCode(auth, oobCode);

          toast.success('Email Verified Successfully!', {
            description: 'Your email has been verified. You can now log in to your account.',
          });

          router.push('/login?verification=success');
        } else if (mode === 'resetPassword') {
          // Handle password reset
          await verifyPasswordResetCode(auth, oobCode);
          setResetMode(true);
        }
      } catch (error) {
        console.error('Action code error:', error);

        if (mode === 'verifyEmail') {
          toast.error('Email Verification Failed', {
            description: 'The verification link may have expired or is invalid.',
          });
          router.push('/login?verification=error');
        } else if (mode === 'resetPassword') {
          setResetError('The password reset link may have expired or is invalid.');
        }
      } finally {
        setIsProcessing(false);
      }
    };

    checkForActionCode();
  }, [searchParams, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setResetError('Invalid password reset link.');
      return;
    }
    
    setIsResetting(true);
    
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setResetSuccess(true);
      toast.success('Password Reset Successful!', {
        description: 'Your password has been reset. You can now log in with your new password.',
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setResetError('Failed to reset password. Please try again.');
    }
    setIsResetting(false);
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Processing...</p>
        </div>
      </div>
    );
  }

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {resetSuccess
                ? 'Your password has been reset successfully.'
                : resetError
                ? 'Password Reset Failed'
                : 'Enter your new password below.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <div className="text-center">
                <p className="mb-4">You will be redirected to the login page shortly...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : resetError ? (
              <div className="space-y-4">
                <div className="text-red-500 text-sm">{resetError}</div>
                <Button onClick={() => router.push('/login')} className="w-full">
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                {resetError && (
                  <div className="text-red-500 text-sm">{resetError}</div>
                )}
                <Button type="submit" className="w-full" loading={isResetting}>
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

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

 }

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
