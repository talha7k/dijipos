'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from '@/hooks/useAuthState';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, ChevronDown, ChevronUp, User } from 'lucide-react';

interface UserProfileWithOrganizationProps {
  isCollapsed?: boolean;
}

export function UserProfileWithOrganization({ 
  isCollapsed = false 
}: UserProfileWithOrganizationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, selectedOrganization, logout } = useAuthState();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    router.push('/company?tab=account');
  };

  const handleSwitchOrganization = () => {
    router.push('/select-organization');
  };

  if (!user) return null;

  if (isCollapsed) {
    return (
      <div className="border-t p-3">
        <div className="flex flex-col items-center space-y-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleSwitchOrganization}>
              <Building2 className="h-4 w-4" />
            </Button>
          <div
            onClick={handleProfileClick}
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <span className="text-primary-foreground text-sm font-medium">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t p-3 relative">
      <div className="space-y-1">
        {/* User Profile Section */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 cursor-pointer hover:bg-secondary/50 p-2 rounded-md transition-colors"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.displayName || user.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Accordion Content - Opens above */}
        {isOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-background border border-border rounded-md shadow-lg z-50">
            <div className="space-y-2 p-3">
              {/* Organization Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Organization</span>
                </div>
                
                 {selectedOrganization ? (
                   <div className="px-2">
                     <p className="text-sm font-medium truncate">{selectedOrganization.name}</p>
                     <p className="text-xs text-muted-foreground truncate">{selectedOrganization.email}</p>
                   </div>
                 ) : (
                   <p className="text-sm text-muted-foreground px-2">No organization selected</p>
                 )}

                 <div className="px-2">
                   <Button
                     variant="outline"
                     size="sm"
                     className="w-full h-8 text-sm"
                     onClick={handleSwitchOrganization}
                   >
                     {selectedOrganization ? 'Switch Organization' : 'Select Organization'}
                   </Button>
                 </div>
              </div>

              {/* Divider */}
              <div className="border-t"></div>

              {/* Action Buttons */}
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleProfileClick}
                  className="w-full justify-start h-8 text-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start h-8 text-sm text-destructive hover:text-destructive"
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