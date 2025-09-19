"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/hooks/useAuth";
import { useAtom, useSetAtom } from 'jotai';
import { selectedOrganizationAtom, logoutAtom } from '@/atoms';
import { themeAtom, sidebarCollapsedAtom } from '@/atoms/uiAtoms';

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

  const logout = useSetAtom(logoutAtom);

  const handleLogout = () => {
    logout();
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
