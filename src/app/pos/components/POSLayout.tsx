import React from 'react';
import { cn } from '@/lib/utils';

interface POSLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function POSLayout({ children, className }: POSLayoutProps) {
  return (
    <div className={cn("h-screen bg-background grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0", className)}>
      {children}
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
}

export function POSRightColumn({ children, className }: POSRightColumnProps) {
  return (
    <div className={cn("hidden lg:block h-screen", className)}>
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
    <div className={cn("bg-card shadow p-4 border-b border-r lg:border-r-0", className)}>
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