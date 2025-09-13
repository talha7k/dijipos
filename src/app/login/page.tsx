'use client';

import { useState, useEffect, Suspense } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showVerificationMessage = searchParams.get('verification') === 'true';
  const verificationSuccess = searchParams.get('verification') === 'success';
  const verificationError = searchParams.get('verification') === 'error';
  const resetSuccess = searchParams.get('reset') === 'success';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified
      if (!user.emailVerified) {
        // Sign out the user
        await auth.signOut();
        setError('Please verify your email before logging in.');
        setIsLoading(false);
        return;
      }

       toast.success('Welcome back!', {
         description: 'You have successfully logged in to your account.',
       });

       router.push('/select-organization');
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      // Check if it's a Firebase Auth error
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            setError('No account found with this email. Please register first.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password. Please try again.');
            break;
          case 'auth/invalid-credential':
            setError('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'auth/user-disabled':
            setError('This account has been disabled. Please contact support.');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed login attempts. Please try again later.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address. Please enter a valid email.');
            break;
          default:
            setError('Login failed: ' + firebaseError.message);
        }
      } else if (err instanceof Error) {
        // Fallback for other error types
        setError('Login failed: ' + err.message);
      } else {
        setError('Login failed: Unknown error');
      }
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/action`,
      });
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      
      // Check if it's a Firebase Auth error
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            setError('No account found with this email. Please register first.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address. Please enter a valid email.');
            break;
          case 'auth/too-many-requests':
            setError('Too many password reset attempts. Please try again later.');
            break;
          default:
            setError('Failed to send reset email: ' + firebaseError.message);
        }
      } else if (err instanceof Error) {
        // Fallback for other error types
        setError('Failed to send reset email: ' + err.message);
      } else {
        setError('Failed to send reset email. Please check your email address.');
      }
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setError('');
    setSuccess('');
    setIsResendLoading(true);
    
    try {
      // First sign in the user to get their user object
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user, {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true,
      });
      
      // Sign out the user
      await auth.signOut();
      
      setVerificationSent(true);
      setSuccess('Verification email sent! Please check your inbox.');
      toast.success('Verification Email Sent!', {
        description: 'Please check your email inbox for the verification link.',
      });
    } catch (err: unknown) {
      console.error('Resend verification error:', err);
      
      // Check if it's a Firebase Auth error
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message: string };
        
        switch (firebaseError.code) {
          case 'auth/user-not-found':
            setError('No account found with this email. Please register first.');
            break;
          case 'auth/wrong-password':
            setError('Incorrect password. Please enter the correct password to resend verification.');
            break;
          case 'auth/invalid-credential':
            setError('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'auth/user-disabled':
            setError('This account has been disabled. Please contact support.');
            break;
          case 'auth/too-many-requests':
            setError('Too many failed login attempts. Please try again later.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address. Please enter a valid email.');
            break;
          default:
            setError('Failed to resend verification: ' + firebaseError.message);
        }
      } else if (err instanceof Error) {
        // Fallback for other error types
        setError('Failed to resend verification: ' + err.message);
      } else {
        setError('Failed to resend verification: Unknown error');
      }
    }
    setIsResendLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if organization exists, if not create one
      const organizationRef = doc(db, 'organizations', user.uid);
      const organizationSnap = await getDoc(organizationRef);

      if (!organizationSnap.exists()) {
        // Create organization for Google user
        await setDoc(organizationRef, {
          id: user.uid,
          name: user.displayName || 'My Organization',
          email: user.email,
          createdAt: new Date(),
          subscriptionStatus: 'trial',
        });
       }

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
    setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isResetMode ? 'Reset Password' : 'Sign In'}</CardTitle>
          <CardDescription>
            {isResetMode
              ? 'Enter your email to receive a password reset link'
              : 'Enter your credentials to access your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
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
          
          {resetSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Your password has been reset successfully. You can now log in with your new password.
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={isResetMode ? handlePasswordReset : handleLogin} className="space-y-4">
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
            {!isResetMode && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" loading={isLoading}>
              {isResetMode ? 'Send Reset Email' : 'Sign In'}
            </Button>

            {!isResetMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  loading={isGoogleLoading}
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
              </>
            )}
          </form>
          <div className="mt-4 text-center space-y-2">
            {!isResetMode ? (
              <>
                {error && error.includes('verify your email') && (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendVerification}
                    loading={isResendLoading}
                    className="p-0 h-auto text-sm"
                  >
                    Resend verification email
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
                <div>
                  <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
                  <a href="/register" className="text-sm text-blue-600 hover:underline">
                    Sign up
                  </a>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsResetMode(false)}
                className="text-sm text-primary hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginPageComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

export default function LoginPage() {
  return <LoginPageComponent />;
}