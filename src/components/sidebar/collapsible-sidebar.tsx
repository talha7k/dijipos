"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useThemeState } from "@/hooks/useThemeState";
import { useAuthState } from "@/hooks/useAuthState";
import { useSidebarState } from "@/hooks/useSidebarState";
import { auth } from "@/lib/firebase";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarProps } from "./sidebar-types";

export function CollapsibleSidebar({ className }: SidebarProps) {
  const { sidebarCollapsed: isCollapsed, toggleSidebar: toggleCollapse } = useSidebarState();
  const [openSections, setOpenSections] = React.useState<{
    [key: string]: boolean;
  }>({
    Sales: true,
    Purchases: true,
  });
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeState();
  const user = useUser();
  const organizationId = useOrganizationId();

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const sidebarProps = {
    className,
    isCollapsed,
    onToggleCollapse: toggleCollapse,
    onThemeToggle: toggleTheme,
    theme,
    pathname: pathname || undefined,
    user: user ? {
      email: user.email || undefined,
      displayName: user.displayName || undefined,
    } : undefined,
    organizationId: organizationId || undefined,
    onLogout: handleLogout,
    onSectionToggle: toggleSection,
    onExpandSidebar: isCollapsed ? toggleCollapse : undefined,
    openSections,
  };

  return (
    <>
      <DesktopSidebar {...sidebarProps} />
      <MobileSidebar {...sidebarProps} />
    </>
  );
}
