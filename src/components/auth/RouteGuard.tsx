'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAtomValue } from 'jotai';
import { useAuth } from '@/lib/hooks/useAuth';
import { selectedOrganizationAtom, userOrganizationsAtom, organizationErrorAtom } from '@/atoms/organizationAtoms';
import { organizationLoadingAtom } from '@/atoms';
import { toast } from 'sonner';
import { indexedDBStorage } from '@/lib/storage';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const currentOrganization = useAtomValue(selectedOrganizationAtom);
  const userOrganizations = useAtomValue(userOrganizationsAtom);
  const organizationLoading = useAtomValue(organizationLoadingAtom);
  const organizationError = useAtomValue(organizationErrorAtom);

  // Log when organizationLoading changes
  useEffect(() => {
    console.log('RouteGuard: organizationLoading changed to', organizationLoading);
  }, [organizationLoading]);

  // Adapt legacy variables
  const loading = authLoading;
  const error = organizationError;
  const organizationId = currentOrganization?.id;
  const emailVerified = user?.emailVerified ?? false; // Firebase user has emailVerified property
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
    if (loading || organizationLoading) return;

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
        // Allow access to select-organization page if user has organizations 
        // or if explicitly navigating there (even with existing organization)
        // This allows users to switch organizations or create new ones
        if (organizationId && userOrganizations.length === 0) {
          // User has organizationId but no organizations (invalid state), redirect to dashboard
          router.push('/dashboard');
          return;
        }
        // Otherwise, allow access to the page
        return;
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
        // Only redirect if we're not still loading organizations
        if (!organizationLoading) {
          // User needs to select an organization
          if (userOrganizations.length > 0) {
            router.push('/select-organization');
          } else {
            // User has no organizations, they need to create or be invited to one
            router.push('/select-organization');
          }
          return;
        }
      } else if (organizationId && !currentOrganization && !organizationLoading) {
        // organizationId is set but selectedOrganization is not - this might be a timing issue
        // Allow access to protected routes if organizationId exists and user has organizations
        if (userOrganizations.some(ou => ou.id === organizationId)) {
          // organizationId is valid, allow access
          return;
        } else {
          // organizationId is invalid, redirect to select-organization
          router.push('/select-organization');
          return;
        }
      }
    }
  }, [
    loading,
    organizationLoading,
    error,
    organizationError,
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

  // Show loading state - be more defensive about organization loading
  if (loading || organizationLoading || !currentOrganization) {
    console.log('RouteGuard: Showing loading - authLoading:', loading, 'organizationLoading:', organizationLoading, 'currentOrganization:', currentOrganization);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">
            {loading ? 'Authenticating...' :
             organizationLoading ? 'Loading organizations...' :
             'Setting up organization...'}
          </p>
          {(organizationLoading && !loading) && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-muted/10 hover:bg-muted rounded-md text-sm transition-colors"
            >
              Retry Loading
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    const isOrganizationError = error.toLowerCase().includes('organization') || error.toLowerCase().includes('timeout');
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-800 font-medium text-lg">
            {isOrganizationError ? 'Organization Loading Error' : 'Authentication Error'}
          </h3>
          <p className="text-red-600 mt-2">{error}</p>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              {isOrganizationError ? 'Retry Loading Organizations' : 'Retry'}
            </button>
            <button
              onClick={async () => {
                // Clear any stored organization data and reload
                try {
                  await indexedDBStorage.removeItem('selectedOrgId');
                } catch (err) {
                  console.error('Error clearing cache:', err);
                }
                window.location.reload();
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Cache and Retry
            </button>
          </div>
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
  if (user && emailVerified && (currentOrganization || (organizationId && userOrganizations.some(ou => ou.id === organizationId)))) {
    return <>{children}</>;
  }

  // Return null for all other cases (will redirect in useEffect)
  return null;
}