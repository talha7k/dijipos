import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { indexedDBStorage } from "@/lib/storage";

// =====================
// THEME STATE ATOMS
// =====================

export const themeAtom = atomWithStorage<"light" | "dark">(
  "dijibill-theme",
  "dark",
  indexedDBStorage,
);

// =====================
// SIDEBAR STATE ATOMS
// =====================

export const sidebarCollapsedAtom = atomWithStorage<boolean>(
  "dijibill-sidebar-collapsed",
  false,
  indexedDBStorage,
);
export const mobileSidebarOpenAtom = atom<boolean>(false);

// =====================
// MODAL STATE ATOMS
// =====================

export const receiptPrintModalOpenAtom = atom<boolean>(false);
export const paymentSuccessModalOpenAtom = atom<boolean>(false);
export const tableActionsModalOpenAtom = atom<boolean>(false);
export const addTableModalOpenAtom = atom<boolean>(false);
export const addProductModalOpenAtom = atom<boolean>(false);
export const addCategoryModalOpenAtom = atom<boolean>(false);

// =====================
// LOADING STATE ATOMS
// =====================

export const globalLoadingAtom = atom<boolean>(false);
export const sidebarLoadingAtom = atom<boolean>(false);

// =====================
// NOTIFICATION STATE ATOMS
// =====================

export const notificationAtom = atom<{
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
} | null>(null);
