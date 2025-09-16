import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';

import {
  sidebarCollapsedAtom,
  mobileSidebarOpenAtom
} from '@/store/atoms';

export function useSidebarState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useAtom(mobileSidebarOpenAtom);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
  };

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return {
    sidebarCollapsed,
    mobileSidebarOpen,
    setSidebarCollapsed,
    setMobileSidebarOpen,
    toggleSidebar,
    openMobileSidebar,
    closeMobileSidebar,
    toggleMobileSidebar,
  };
}

// Read-only hooks for optimization
export function useSidebarCollapsed() {
  return useAtomValue(sidebarCollapsedAtom);
}

export function useMobileSidebarOpen() {
  return useAtomValue(mobileSidebarOpenAtom);
}