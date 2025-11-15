"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom, selectedOrganizationAtom, organizationLoadingAtom } from "@/atoms";
import { useAuth } from "@/lib/hooks/useAuth";
import FullPageLoader from "@/components/ui/FullPageLoader";

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();


   const { user } = useAuth();
   const selectedOrgId = useAtomValue(selectedOrganizationIdAtom);
   const selectedOrganization = useAtomValue(selectedOrganizationAtom);
   const orgLoading = useAtomValue(organizationLoadingAtom);

  // Routes that don't require organization selection
  const organizationOptionalRoutes = [
    "/select-organization",
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
    "/superadmin",
  ].concat(
    pathname && pathname.startsWith("/auth") ? [pathname] : []
  );

   // Derive redirect state
   const shouldRedirect = user && !orgLoading && !organizationOptionalRoutes.includes(pathname || "") &&
     (!selectedOrgId || (selectedOrgId && !selectedOrganization));

   // Handle redirects in useEffect to avoid setState during render
   useEffect(() => {
     if (shouldRedirect) {
       router.replace("/select-organization");
     }
   }, [shouldRedirect, router]);

   // Show loader while checking organization or redirecting
   if (user && orgLoading || shouldRedirect) {
     return <FullPageLoader />;
   }

   // If user is logged in but has no valid organization, show loader (redirect handled in useEffect)
   const hasValidOrganization = selectedOrgId && selectedOrganization;
   if (user && !hasValidOrganization && !organizationOptionalRoutes.includes(pathname || "")) {
     return <FullPageLoader />;
   }

  // If all checks pass, render the children
  return <>{children}</>;
}