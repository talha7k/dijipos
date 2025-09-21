"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";
import { useAuth } from "@/lib/hooks/useAuth";
import { selectedOrganizationAtom, logoutAtom, organizationUserRoleAtom } from "@/atoms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, LogOut, ChevronDown, ChevronUp, User } from "lucide-react";

interface UserProfileWithOrganizationProps {
  isCollapsed?: boolean;
}

export function UserProfileWithOrganization({
  isCollapsed = false,
}: UserProfileWithOrganizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationUserRole = useAtomValue(organizationUserRoleAtom);
  const logout = useSetAtom(logoutAtom);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSwitchOrganization = () => {
    router.push("/select-organization");
  };

  if (!user) return null;

  if (isCollapsed) {
    return (
      <div className="border-t p-2">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-medium">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          {selectedOrganization && (
            <Badge variant="secondary" className="text-xs w-full text-wrap">
              <Building2 className="h-3 w-3 mr-1" />
              <span className="truncate">{selectedOrganization.name}</span>
            </Badge>
          )}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleSwitchOrganization}
            >
              <Building2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleLogout}
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t p-2 relative">
      <div className="space-y-2">
        {/* User Profile Section */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer hover:bg-secondary/50 p-1.5 rounded-md transition-colors space-y-2"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium truncate">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {organizationUserRole?.role ? organizationUserRole.role.charAt(0).toUpperCase() + organizationUserRole.role.slice(1) : ''}
              </p>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          {selectedOrganization && (
            <Badge variant="secondary" className="text-xs w-full text-wrap bg-primary/10 border-primary/10">
              <Building2 className="h-4 w-4 mr-1" />
              <span className="text-wrap">{selectedOrganization.name}</span>
            </Badge>
          )}
        </div>

        {/* Accordion Content - Opens above */}
        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-md shadow-lg z-50">
            <div className="space-y-2 p-2">
              {/* Organization Section */}
              <div className="space-y-2">
                {selectedOrganization ? (
                  <div
                    className="px-1.5 py-2 flex items-center cursor-pointer bg-primary/10 border border-primary/10 rounded-md hover:bg-primary-hover transition-colors"
                    onClick={handleSwitchOrganization}
                    title="Switch Organization"
                  >
                    <Building2 className="h-8 w-8 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedOrganization.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {selectedOrganization.phone || selectedOrganization.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="px-1.5 py-2 flex items-center cursor-pointer bg-primary/10 border border-primary/10 rounded-md hover:bg-primary-hover transition-colors"
                    onClick={handleSwitchOrganization}
                    title="Select Organization"
                  >
                    <Building2 className="h-8 w-8 mr-2 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      No organization selected
                    </p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Action Buttons */}
              <div className="space-y-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="w-full justify-start h-7 text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start h-7 text-sm text-destructive hover:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
