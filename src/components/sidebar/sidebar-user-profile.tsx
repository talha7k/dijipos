"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { SidebarProps } from "./sidebar-types";

interface SidebarUserProfileProps extends Partial<SidebarProps> {
  onProfileClick?: () => void;
}

export function SidebarUserProfile({
  user,
  isCollapsed = false,
  onLogout,
  onProfileClick,
}: SidebarUserProfileProps) {
  const router = useRouter();

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      router.push("/company?tab=account");
    }
  };

  if (!user) return null;

  return (
    <div className="border-t p-3 pb-4">
      {!isCollapsed ? (
        <div className="space-y-1">
          <div
            onClick={handleProfileClick}
            className="flex items-center space-x-3 cursor-pointer hover:bg-secondary/50 p-1 rounded-md transition-colors"
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
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="w-full justify-center h-8 px-3"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
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
            onClick={onLogout}
            className="h-8 w-8 p-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}