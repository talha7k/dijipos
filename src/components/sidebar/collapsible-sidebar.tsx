"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAtom } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms/organizationAtoms';
import { themeAtom, sidebarCollapsedAtom } from '@/atoms/uiAtoms';
import { auth } from "@/lib/firebase/config";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileSidebar } from "./mobile-sidebar";
import { SidebarProps } from "./sidebar-types";

export function CollapsibleSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useAtom(sidebarCollapsedAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [openSections, setOpenSections] = React.useState<{
    [key: string]: boolean;
  }>({
    Sales: true,
    Purchases: true,
  });
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

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
