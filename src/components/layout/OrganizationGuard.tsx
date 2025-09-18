"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom, organizationLoadingAtom } from "@/atoms";
import { useAuth } from "@/lib/hooks/useAuth";
import FullPageLoader from "@/components/ui/FullPageLoader";

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { user } = useAuth();
  const selectedOrgId = useAtomValue(selectedOrganizationIdAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom);

  // Routes that don't require organization selection
  const organizationOptionalRoutes = [
    "/select-organization",
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
  ].concat(
    pathname && pathname.startsWith("/auth") ? [pathname] : []
  );

  // Handle redirects in useEffect to avoid setState during render
  useEffect(() => {
    if (user && !selectedOrgId && !orgLoading && !organizationOptionalRoutes.includes(pathname || "")) {
      setIsRedirecting(true);
      router.replace("/select-organization");
    } else {
      setIsRedirecting(false);
    }
  }, [user, selectedOrgId, orgLoading, pathname, router, organizationOptionalRoutes]);

  // Show loader while checking organization or redirecting
  if (user && orgLoading || isRedirecting) {
    return <FullPageLoader />;
  }

  // If user is logged in but has no organization selected, show loader (redirect handled in useEffect)
  if (user && !selectedOrgId && !organizationOptionalRoutes.includes(pathname || "")) {
    return <FullPageLoader />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}