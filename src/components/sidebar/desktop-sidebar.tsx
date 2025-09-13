"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavSection } from "./sidebar-nav-section";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarUserProfile } from "./sidebar-user-profile";
import { SidebarProps, NavigationItem } from "./sidebar-types";
import {
  BarChart3,
  Building2,
  FileText,
  Home,
  PieChart,
  Receipt,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Sales",
    icon: Receipt,
    children: [
      {
        title: "Invoices",
        href: "/invoices",
        icon: Receipt,
      },
      {
        title: "Quotes",
        href: "/quotes",
        icon: FileText,
      },
      {
        title: "Payments",
        href: "/payments",
        icon: Wallet,
      },
      {
        title: "Products & Services",
        href: "/products-services",
        icon: BarChart3,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
    ],
  },
  {
    title: "Purchases",
    icon: Receipt,
    children: [
      {
        title: "Invoices",
        href: "/purchase-invoices",
        icon: Receipt,
      },
      {
        title: "Products & Services",
        href: "/purchase-products-services",
        icon: BarChart3,
      },
      {
        title: "Suppliers",
        href: "/suppliers",
        icon: Users,
      },
    ],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: PieChart,
  },
  {
    title: "Company",
    href: "/company",
    icon: Building2,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function DesktopSidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  onThemeToggle,
  theme = "light",
  pathname = "",
  user,
  onLogout,
  onSectionToggle,
  openSections = {},
}: SidebarProps) {
  return (
    <div
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:w-16" : "md:w-64",
        className
      )}
    >
      <div className="flex flex-col flex-grow border-r bg-background">
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
          onThemeToggle={onThemeToggle}
          theme={theme}
        />

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              if (item.children) {
                const isSectionOpen = openSections[item.title];
                const hasActiveChild = item.children.some(
                  (child) => pathname === child.href
                );
                return (
                  <SidebarNavSection
                    key={item.title}
                    item={item}
                    isSectionOpen={isSectionOpen}
                    isCollapsed={isCollapsed}
                    hasActiveChild={hasActiveChild}
                    pathname={pathname}
                    onToggle={() => onSectionToggle && onSectionToggle(item.title)}
                  />
                );
              } else {
                const isActive = pathname === item.href;
                return (
                  <SidebarNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    isCollapsed={isCollapsed}
                  />
                );
              }
            })}
          </nav>
        </ScrollArea>

        {user && (
          <SidebarUserProfile
            user={user}
            isCollapsed={isCollapsed}
            onLogout={onLogout}
          />
        )}
      </div>
    </div>
  );
}