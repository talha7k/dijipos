// components/layout/AuthGuard.jsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { useAuth } from "@/lib/hooks/useAuth";
import { selectedOrganizationIdAtom, organizationLoadingAtom } from "@/atoms";

import FullPageLoader from "@/components/ui/FullPageLoader"; // Assuming you have a loader

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const selectedOrgId = useAtomValue(selectedOrganizationIdAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom);

  const isPublicRoute =
    pathname && ["/login", "/register", "/verify-email", "/reset-password"].includes(
      pathname,
    ) || (pathname && pathname.startsWith("/auth"));

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!authLoading && !isPublicRoute && !user) {
      setIsRedirecting(true);
      router.replace("/login");
    } else if (!authLoading && !isPublicRoute && user && !selectedOrgId && !orgLoading && pathname !== "/select-organization") {
      setIsRedirecting(true);
      router.replace("/select-organization");
    } else {
      setIsRedirecting(false);
    }
  }, [authLoading, isPublicRoute, user, selectedOrgId, orgLoading, pathname, router]);

  // 1. Show a loader during initial auth and organization checks or while redirecting
  if (authLoading || (!isPublicRoute && user && orgLoading) || isRedirecting) {
    return <FullPageLoader />;
  }

  // 2. If it's a public route, let them pass
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // --- From here on, we are on a protected route ---

  // 3. If no user, show loader (redirect handled in useEffect)
  if (!user) {
    return <FullPageLoader />;
  }

  // 4. If user is logged in but has no organization selected, show the manager
  // This covers the /select-organization case implicitly
  if (user && !selectedOrgId) {
    // Let the select-organization page render itself
    if (pathname === "/select-organization") {
      return <>{children}</>;
    }
    // For any other page, show loader (redirect handled in useEffect)
    return <FullPageLoader />;
  }

  // 5. If all checks pass, render the protected page layout
  return <>{children}</>;
}
