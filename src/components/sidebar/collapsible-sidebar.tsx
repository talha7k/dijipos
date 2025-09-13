"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/firebase";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarProps } from "./sidebar-types";

export function CollapsibleSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openSections, setOpenSections] = React.useState<{
    [key: string]: boolean;
  }>({
    Sales: true,
    Purchases: true,
  });
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, tenantId } = useAuth();

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
    onToggleCollapse: () => setIsCollapsed(!isCollapsed),
    onThemeToggle: toggleTheme,
    theme,
    pathname,
    user: user ? {
      email: user.email || undefined,
      displayName: user.displayName || undefined,
    } : undefined,
    tenantId: tenantId || undefined,
    onLogout: handleLogout,
    onSectionToggle: toggleSection,
    openSections,
  };

  return (
    <>
      <DesktopSidebar {...sidebarProps} />
      <MobileSidebar {...sidebarProps} />
    </>
  );
}
