import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  sidebarCollapsedAtom, 
  mobileSidebarOpenAtom 
} from '@/store/atoms';

export function useUIState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useAtom(sidebarCollapsedAtom);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useAtom(mobileSidebarOpenAtom);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const openMobileSidebar = () => {
    setMobileSidebarOpen(true);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(prev => !prev);
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

export function useSetSidebarCollapsed() {
  return useSetAtom(sidebarCollapsedAtom);
}

export function useSetMobileSidebarOpen() {
  return useSetAtom(mobileSidebarOpenAtom);
}