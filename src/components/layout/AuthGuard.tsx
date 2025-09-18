// components/layout/AuthGuard.jsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { useAuth } from "@/lib/hooks/useAuth";
import { selectedOrganizationIdAtom } from "@/atoms";
import { OrganizationManager } from "@/components/organization/OrganizationManager";
import FullPageLoader from "@/components/ui/FullPageLoader"; // Assuming you have a loader

export function AuthGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const selectedOrgId = useAtomValue(selectedOrganizationIdAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom); // Assuming you have this atom

  const isPublicRoute =
    ["/login", "/register", "/verify-email", "/reset-password"].includes(
      pathname,
    ) || pathname.startsWith("/auth");

  // 1. Show a loader during initial auth and organization checks
  if (authLoading || (!isPublicRoute && user && orgLoading)) {
    return <FullPageLoader />;
  }

  // 2. If it's a public route, let them pass
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // --- From here on, we are on a protected route ---

  // 3. If no user, redirect to login
  if (!user) {
    router.replace("/login"); // Use replace to avoid adding to history
    return <FullPageLoader />; // Show loader while redirecting
  }

  // 4. If user is logged in but has no organization selected, show the manager
  // This covers the /select-organization case implicitly
  if (user && !selectedOrgId) {
    // Let the select-organization page render itself
    if (pathname === "/select-organization") {
      return <>{children}</>;
    }
    // For any other page, redirect to the selection screen
    router.replace("/select-organization");
    return <FullPageLoader />;
  }

  // 5. If all checks pass, render the protected page layout
  return <>{children}</>;
}
