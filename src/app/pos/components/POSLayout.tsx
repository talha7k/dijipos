import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface POSLayoutProps {
  children: React.ReactNode;
  className?: string;
  mobileSidebarOpen?: boolean;
  onMobileSidebarToggle?: () => void;
}

export function POSLayout({ children, className, mobileSidebarOpen = false, onMobileSidebarToggle }: POSLayoutProps) {
  return (
    <div className={cn("h-screen bg-background grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0", className)}>
      {children}
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Button
          onClick={onMobileSidebarToggle}
          className="rounded-full w-14 h-14 shadow-lg"
          size="sm"
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </div>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileSidebarToggle}
        />
      )}
    </div>
  );
}

interface POSLeftColumnProps {
  children: React.ReactNode;
  className?: string;
}

export function POSLeftColumn({ children, className }: POSLeftColumnProps) {
  return (
    <div className={cn("flex flex-col min-h-0", className)}>
      {children}
    </div>
  );
}

interface POSRightColumnProps {
  children: React.ReactNode;
  className?: string;
  mobileOpen?: boolean;
}

export function POSRightColumn({ children, className, mobileOpen = false }: POSRightColumnProps) {
  return (
    <div className={cn(
      "h-screen",
      mobileOpen ? "fixed right-0 top-0 z-50 lg:static lg:z-auto" : "hidden lg:block",
      className
    )}>
      {children}
    </div>
  );
}

interface POSHeaderContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function POSHeaderContainer({ children, className }: POSHeaderContainerProps) {
  return (
    <div className={cn("bg-card p-0 border-b border-r lg:border-r-0", className)}>
      {children}
    </div>
  );
}

interface POSMainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function POSMainContent({ children, className }: POSMainContentProps) {
  return (
    <div className={cn("flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}