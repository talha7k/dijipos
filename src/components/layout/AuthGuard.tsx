// components/layout/AuthGuard.jsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import FullPageLoader from "@/components/ui/FullPageLoader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const isPublicRoute =
    pathname && ["/login", "/register", "/verify-email", "/reset-password"].includes(
      pathname,
    ) || (pathname && pathname.startsWith("/auth"));

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (!authLoading && !isPublicRoute && !user) {
      setIsRedirecting(true);
      router.replace("/login");
    } else {
      setIsRedirecting(false);
    }
  }, [authLoading, isPublicRoute, user, router]);

  // 1. Show a loader during initial auth check or while redirecting
  if (authLoading || isRedirecting) {
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

  // 4. If user is authenticated, render the children (organization check handled by OrganizationGuard)
  return <>{children}</>;
}
