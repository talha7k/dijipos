'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        if (!searchParams) {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new verification email.');
          return;
        }

        // Get the action code from the URL
        const actionCode = searchParams.get('oobCode');

        if (!actionCode) {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new verification email.');
          return;
        }

        // Check the action code
        const info = await checkActionCode(auth, actionCode);

        // Apply the action code (verify email)
        await applyActionCode(auth, actionCode);

        setStatus('success');
        setMessage('Your email has been successfully verified!');

        // Show success toast
        toast.success('Email Verified Successfully!', {
          description: 'Your email has been verified. You can now log in to your account.',
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage(
          error instanceof Error
            ? error.message
            : 'Failed to verify email. The link may have expired or been used already.'
        );

        // Show error toast
        toast.error('Email Verification Failed', {
          description: error instanceof Error ? error.message : 'Please try again or request a new verification email.',
        });
      }
    };

    handleEmailVerification();
  }, [router, searchParams]);

  const handleResendEmail = async () => {
    try {
      // This would typically be handled from the user's profile page
      // For now, we'll redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error redirecting to login:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Verifying your email address...'}
            {status === 'success' && 'Email Verified Successfully!'}
            {status === 'error' && 'Verification Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {status !== 'loading' && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'} className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-muted-foreground mb-4">
              You will be redirected to the login page shortly...
            </p>
          )}
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button 
                onClick={handleResendEmail} 
                variant="outline" 
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

export default function VerifyEmailPage() {
  return <VerifyEmailPageComponent />;
}