'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { 
    user, 
    loading, 
    error, 
    emailVerified, 
    currentOrganization, 
    userOrganizations, 
    organizationId 
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register', 
    '/verify-email',
    '/reset-password',
    '/auth'
  ];

  // Define routes that require authentication but no organization
  const authOnlyRoutes = [
    '/select-organization'
  ];

  const isPublicRoute = pathname ? publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  ) : false;

  const isAuthOnlyRoute = pathname ? authOnlyRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  ) : false;

  useEffect(() => {
    if (loading) return;

    // Handle public routes
    if (isPublicRoute) {
      if (user && emailVerified) {
        // If user is logged in and verified, redirect based on organization status
        if (organizationId) {
          router.push('/dashboard');
        } else if (userOrganizations.length > 0) {
          router.push('/select-organization');
        } else {
          router.push('/select-organization');
        }
      }
      return;
    }

    // Handle authentication-only routes (like select-organization)
    if (isAuthOnlyRoute) {
      if (!user) {
        toast.error('Authentication Required', {
          description: 'Please log in to access this page.',
        });
        router.push('/login');
        return;
      }

      if (!emailVerified) {
        toast.error('Email Verification Required', {
          description: 'Please check your email and click the verification link to access your account.',
        });
        router.push('/login?verification=true');
        return;
      }

      // For select-organization page, check if user actually needs to select
      if (pathname === '/select-organization') {
        if (organizationId) {
          // User already has organization selected, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      }
      return;
    }

    // Handle protected routes (require both auth and organization)
    if (!isPublicRoute && !isAuthOnlyRoute) {
      if (!user) {
        toast.error('Authentication Required', {
          description: 'Please log in to access this page.',
        });
        router.push('/login');
        return;
      }

      if (!emailVerified) {
        toast.error('Email Verification Required', {
          description: 'Please check your email and click the verification link to access your account.',
        });
        router.push('/login?verification=true');
        return;
      }

      if (!currentOrganization && !organizationId) {
        // User needs to select an organization
        if (userOrganizations.length > 0) {
          router.push('/select-organization');
        } else {
          // User has no organizations, they need to create or be invited to one
          router.push('/select-organization');
        }
        return;
      }
    }
  }, [
    loading,
    user,
    emailVerified,
    currentOrganization,
    userOrganizations,
    organizationId,
    pathname,
    isPublicRoute,
    isAuthOnlyRoute,
    router
  ]);

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-medium">Authentication Error</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // For public routes, render children directly
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For auth-only routes, render children if user is authenticated
  if (isAuthOnlyRoute) {
    if (user && emailVerified) {
      return <>{children}</>;
    }
    return null; // Will redirect in useEffect
  }

  // For protected routes, render children only if user is authenticated and has organization
  if (user && emailVerified && (currentOrganization || organizationId)) {
    return <>{children}</>;
  }

  // Return null for all other cases (will redirect in useEffect)
  return null;
}