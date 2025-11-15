"use client";

import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/sidebar/collapsible";
import { NavigationItem } from "./sidebar-types";

interface SidebarNavSectionProps {
  item: NavigationItem;
  isSectionOpen?: boolean;
  isCollapsed?: boolean;
  hasActiveChild?: boolean;
  pathname?: string;
  onToggle?: () => void;
  onExpandSidebar?: () => void;
  className?: string;
}

export function SidebarNavSection({
  item,
  isSectionOpen = false,
  isCollapsed = false,
  hasActiveChild = false,
  pathname = "",
  onToggle,
  onExpandSidebar,
  className,
}: SidebarNavSectionProps) {
  if (!item.children) return null;

  return (
    <Collapsible open={isSectionOpen} onOpenChange={isCollapsed ? onExpandSidebar : onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isCollapsed ? "px-2" : "px-3",
            hasActiveChild && "bg-secondary/50",
            className
          )}
        >
          <item.icon
            className={cn("h-4 w-4", !isCollapsed && "mr-3")}
          />
          {!isCollapsed && (
            <>
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 ml-auto transition-transform",
                  isSectionOpen ? "rotate-180" : ""
                )}
              />
            </>
          )}
        </Button>
      </CollapsibleTrigger>
      {!isCollapsed && (
        <CollapsibleContent className="space-y-1 ml-6">
          {item.children.map((child) => {
            const isActive = pathname === child.href;
            return (
              <Link key={child.href} href={(child.href || "#") as Route}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full justify-start px-2",
                    isActive && "bg-secondary"
                  )}
                >
                  <child.icon className="h-3 w-3 mr-2" />
                  <span className="text-sm">{child.title}</span>
                </Button>
              </Link>
            );
          })}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}