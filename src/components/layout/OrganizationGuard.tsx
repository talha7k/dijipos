"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { selectedOrganizationIdAtom, selectedOrganizationAtom, organizationLoadingAtom } from "@/atoms";
import { useAuth } from "@/lib/hooks/useAuth";
import FullPageLoader from "@/components/ui/FullPageLoader";

export function OrganizationGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

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

   // Handle redirects in useEffect to avoid setState during render
   useEffect(() => {
     const shouldRedirect = user && !orgLoading && !organizationOptionalRoutes.includes(pathname || "") &&
       (!selectedOrgId || (selectedOrgId && !selectedOrganization));

     if (shouldRedirect) {
       setIsRedirecting(true);
       router.replace("/select-organization");
     } else {
       setIsRedirecting(false);
     }
   }, [user, selectedOrgId, selectedOrganization, orgLoading, pathname, router, organizationOptionalRoutes]);

   // Show loader while checking organization or redirecting
   if (user && orgLoading || isRedirecting) {
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