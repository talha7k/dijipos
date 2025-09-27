'use client';

import { useState, Suspense } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from '@/components/ui/loader';

function LoginContent() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showVerificationMessage = searchParams?.get('verification') === 'true';
  const verificationSuccess = searchParams?.get('verification') === 'success';
  const verificationError = searchParams?.get('verification') === 'error';

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/select-organization');
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      
      // Check if it's a Firebase Auth error
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        
        switch (firebaseError.code) {
          case 'auth/popup-closed-by-user':
            setError('Google sign-in was cancelled. Please try again.');
            break;
          case 'auth/popup-blocked':
            setError('Google sign-in popup was blocked. Please allow popups and try again.');
            break;
          case 'auth/cancelled-popup-request':
            setError('Google sign-in was cancelled. Please try again.');
            break;
          case 'auth/account-exists-with-different-credential':
            setError('An account already exists with the same email address but different sign-in credentials. Please sign in using a different method.');
            break;
          default:
            setError('Google sign-in failed: ' + firebaseError.message);
        }
      } else if (err instanceof Error) {
        // Fallback for other error types
        setError('Google sign-in failed: ' + err.message);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account with Google</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showVerificationMessage && (
            <Alert className="mb-4">
              <AlertDescription>
                Registration successful! Please check your email to verify your account before logging in.
              </AlertDescription>
            </Alert>
          )}
          
          {verificationSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Your email has been successfully verified! You can now log in to your account.
              </AlertDescription>
            </Alert>
          )}
          
          {verificationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Email verification failed. The verification link may have expired or is invalid. Please try again or request a new verification email.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            loading={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Don&apos;t have an account? </span>
            <a href="/register" className="text-sm text-primary hover:underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPageComponent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginPageComponent />;
}