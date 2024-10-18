"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={cn("flex flex-col items-center", pathname === "/" && "text-primary")}>
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/recent-orders" className={cn("flex flex-col items-center", pathname === "/recent-orders" && "text-primary")}>
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs">Recent Orders</span>
        </Link>
        <Link href="/manage" className={cn("flex flex-col items-center", pathname === "/manage" && "text-primary")}>
          <Settings className="h-6 w-6" />
          <span className="text-xs">Manage</span>
        </Link>
      </div>
    </nav>
  );
}