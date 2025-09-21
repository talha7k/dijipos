'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/loader';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }

    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }
    setStatus('ready');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setStatus('error');
      return;
    }

    setIsSubmitting(true);

    if (!searchParams) {
      setStatus('error');
      setMessage('Invalid reset link. Please request a new password reset.');
      return;
    }

    const oobCode = searchParams.get('oobCode');

    try {
      await confirmPasswordReset(auth, oobCode!, password);
      setStatus('success');
      setMessage('Password reset successfully! You can now log in with your new password.');

      toast.success('Password Reset Successful!', {
        description: 'You can now log in with your new password.',
      });

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      setStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Failed to reset password. The link may have expired or been used already.'
      );

      toast.error('Password Reset Failed', {
        description: error instanceof Error ? error.message : 'Please try again or request a new reset link.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Validating reset link...'}
            {status === 'ready' && 'Enter your new password'}
            {status === 'success' && 'Password Reset Successful!'}
            {status === 'error' && 'Reset Failed'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {message && (
                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Reset Password
              </Button>
            </form>
          )}

          {status !== 'loading' && (
            <Alert variant={status === 'success' ? 'default' : 'destructive'} className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <p className="text-sm text-muted-foreground mt-4">
              You will be redirected to the login page shortly...
            </p>
          )}

          {status === 'error' && (
            <div className="mt-4 space-y-2">
              <Button
                onClick={() => router.push('/login')}
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

function ResetPasswordPageComponent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageComponent />;
}