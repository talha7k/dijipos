"use client";


import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarProps } from "./sidebar-types";
import Image from "next/image";

export function SidebarHeader({
  isCollapsed = false,
  onToggleCollapse,
  onThemeToggle,
  theme = "light",
}: Partial<SidebarProps>) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          <Image
            src="/icon_logo.svg"
            alt="Dijitize.com Logo"
            width={24}
            height={24}
            className="h-8 w-8"
          />
          <span className="font-semibold">Dijitize.com</span>
        </div>
      )}
      <div className="flex items-center space-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onThemeToggle}
          className="h-8 w-8 p-0"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleCollapse}
          className="h-8 w-8 p-0 bg-input hover:bg-primary"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
