"use client";

import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationItem } from "./sidebar-types";

interface SidebarNavItemProps {
  item: NavigationItem;
  isActive?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

export function SidebarNavItem({
  item,
  isActive = false,
  isCollapsed = false,
  className,
}: SidebarNavItemProps) {
  if (!item.href) return null;

  return (
    <Link href={item.href as Route}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start",
          isCollapsed ? "px-2" : "px-3",
          isActive && "bg-secondary",
          className
        )}
      >
        <item.icon
          className={cn("h-4 w-4", !isCollapsed && "mr-3")}
        />
        {!isCollapsed && <span>{item.title}</span>}
      </Button>
    </Link>
  );
}