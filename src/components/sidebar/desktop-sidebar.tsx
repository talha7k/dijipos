"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarHeader } from "./sidebar-header";
import { SidebarNavSection } from "./sidebar-nav-section";
import { SidebarNavItem } from "./sidebar-nav-item";
import { UserProfileWithOrganization } from "../layout/UserProfileWithOrganization";
import { SidebarProps, NavigationItem } from "./sidebar-types";
import { useAuth } from "@/contexts/AuthContext";
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

const getNavigationItems = (role: string): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Point of Sale",
      href: "/pos",
      icon: Receipt,
    },
  ];

  const salesItems: NavigationItem[] = [
    {
      title: "Sales",
      icon: Receipt,
      children: [
        {
          title: "Orders",
          href: "/orders",
          icon: Receipt,
        },
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
  ];

  const purchaseItems: NavigationItem[] = [
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
  ];

  const adminItems: NavigationItem[] = [
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

  const managerItems: NavigationItem[] = [
    {
      title: "Reports",
      href: "/reports",
      icon: PieChart,
    },
  ];

  switch (role) {
    case 'admin':
      return [...baseItems, ...salesItems, ...purchaseItems, ...adminItems];
    case 'manager':
      return [...baseItems, ...salesItems, ...purchaseItems, ...managerItems];
    case 'cashier':
      return [...baseItems, ...salesItems];
    case 'waiter':
      return [...baseItems, ...salesItems];
    default:
      return baseItems;
  }
};

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
  onExpandSidebar,
  openSections = {},
}: SidebarProps) {
  const { organizationUser } = useAuth();
  const navigationItems = getNavigationItems(organizationUser?.role || 'waiter');
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
                     onExpandSidebar={onExpandSidebar}
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
          <UserProfileWithOrganization
            isCollapsed={isCollapsed}
          />
        )}
      </div>
    </div>
  );
}