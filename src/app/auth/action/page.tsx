/C'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function FirebaseActionHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      router.push('/login');
      return;
    }

    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode) {
      // Invalid action, redirect to login
      router.push('/login');
      return;
    }

    switch (mode) {
      case 'verifyEmail':
        // Redirect to verify-email page with the oobCode
        router.push(`/verify-email?oobCode=${oobCode}`);
        break;

      case 'resetPassword':
        // Redirect to reset-password page with the oobCode
        router.push(`/reset-password?oobCode=${oobCode}`);
        break;

      default:
        // Unknown mode, redirect to login
        router.push('/login');
        break;
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Processing...</p>
      </div>
    </div>
  );
}

export default function FirebaseActionHandler() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FirebaseActionHandlerContent />
    </Suspense>
  );
}