import { LucideIcon } from "lucide-react";

export interface NavigationItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  children?: NavigationItem[];
}

export interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onThemeToggle?: () => void;
  theme?: string;
  pathname?: string;
  user?: {
    email?: string;
    displayName?: string;
  };
  organizationId?: string;
  onLogout?: () => void;
  onSectionToggle?: (title: string) => void;
  onExpandSidebar?: () => void;
  openSections?: { [key: string]: boolean };
}