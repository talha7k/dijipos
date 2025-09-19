"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { organizationUserRoleAtom } from "@/atoms";
import { UserRole } from "@/types/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackMessage?: string;
  showUpgrade?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallbackMessage = "You do not have permission to access this page.",
  showUpgrade = false,
}: RoleGuardProps) {
  const router = useRouter();
  const userRole = useAtomValue(organizationUserRoleAtom);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole) {
      const hasAccess = allowedRoles.includes(userRole.role);
      setIsAuthorized(hasAccess);
      setIsLoading(false);
    } else if (userRole === null) {
      // User role is loaded but null (user not in organization)
      setIsAuthorized(false);
      setIsLoading(false);
    }
  }, [userRole, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{fallbackMessage}</p>
            {showUpgrade && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Contact your administrator to upgrade your role.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            )}
            {!showUpgrade && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="w-full"
              >
                Return to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for common role combinations
export function AdminOnlyGuard({
  children,
  ...props
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN]}
      fallbackMessage="This page is restricted to administrators only."
      showUpgrade={true}
      {...props}
    >
      {children}
    </RoleGuard>
  );
}

export function AdminManagerGuard({
  children,
  ...props
}: Omit<RoleGuardProps, "allowedRoles">) {
  return (
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}
      fallbackMessage="This page requires administrator or manager access."
      showUpgrade={true}
      {...props}
    >
      {children}
    </RoleGuard>
  );
}
