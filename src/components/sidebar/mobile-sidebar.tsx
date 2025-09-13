"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { SheetContent } from "@/components/ui/sheet-no-close";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
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

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    mobileSheetClose?: HTMLButtonElement;
  }
}

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

export function MobileSidebar({
  onThemeToggle,
  theme = "light",
  pathname = "",
  user,
  onLogout,
  onSectionToggle,
  openSections = {},
}: SidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-4 left-4 z-40 h-10 w-10 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SheetClose className="sr-only" ref={(node) => {
          if (node) {
            // Store a reference to the close button
            window.mobileSheetClose = node;
          }
        }} />
        <div className="flex flex-col h-full">
          <SidebarHeader
            onThemeToggle={onThemeToggle}
            theme={theme}
            onToggleCollapse={() => {
              // Close the sheet when toggle button is clicked on mobile
              const closeButton = window.mobileSheetClose;
              if (closeButton) {
                closeButton.click();
              }
            }}
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
                    />
                  );
                }
              })}
            </nav>
          </ScrollArea>

          {user && (
            <SidebarUserProfile
              user={user}
              onLogout={onLogout}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}