// components/layout/AppLayout.jsx
"use client";

import { usePathname } from "next/navigation";
import { useAtomValue } from "jotai";
import { sidebarCollapsedAtom } from "@/atoms/uiAtoms";
import { CollapsibleSidebar } from "@/components/sidebar/collapsible-sidebar";

export function AppLayout({ children }) {
  const pathname = usePathname();
  const isCollapsed = useAtomValue(sidebarCollapsedAtom);

  // We don't need a sidebar on these pages, so render nothing.
  // The AuthGuard already handles showing the children for these routes.
  const noLayoutRoutes = [
    "/login",
    "/register",
    "/verify-email",
    "/reset-password",
    "/select-organization",
  ];
  if (noLayoutRoutes.includes(pathname) || pathname.startsWith("/auth")) {
    return <>{children}</>;
  }

  // This is the default layout for all protected pages
  return (
    <div className="flex h-screen bg-background">
      <CollapsibleSidebar />
      <main
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out pt-16 md:pt-0 ${isCollapsed ? "md:ml-16" : "md:ml-64"}`}
      >
        {children}
      </main>
    </div>
  );
}
