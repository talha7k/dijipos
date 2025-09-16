import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Organization, OrganizationUser } from '@/types';
import { Order } from '@/types/order';
import { User } from 'firebase/auth';
import { indexedDBStorage } from '@/lib/storage';

// Re-export atoms from organized modules
export * from './atoms/posAtoms';
export * from './atoms/uiAtoms';

// =====================
// AUTH STATE ATOMS
// =====================

// Firebase User state
export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom<boolean>(true);
export const authErrorAtom = atom<string | null>(null);
export const authInitializedAtom = atom<boolean>(false);
export const emailVerifiedAtom = atom<boolean>(false);

// Organization state
export const selectedOrganizationAtom = atom<Organization | null>(null);
export const organizationUserAtom = atom<OrganizationUser | null>(null);
export const userOrganizationsAtom = atom<OrganizationUser[]>([]);
export const organizationLoadingAtom = atom<boolean>(false);
export const organizationErrorAtom = atom<string | null>(null);
export const organizationIdAtom = atomWithStorage<string | null>('dijibill-organization-id', null, indexedDBStorage);

// =====================
// ORDER STATE ATOMS
// =====================

// Client-side selection state for orders
export const currentOrderAtom = atom<Order | null>(null);

// =====================
// DERIVED ATOMS
// =====================

// Auth derived atoms
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);
export const hasOrganizationAtom = atom((get) => get(selectedOrganizationAtom) !== null);
export const hasOrganizationsAtom = atom((get) => get(userOrganizationsAtom).length > 0);

// =====================
// UTILITY ATOMS
// =====================

// Reset atoms for clearing state
export const resetAuthStateAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(organizationUserAtom, null);
  set(selectedOrganizationAtom, null);
  set(userOrganizationsAtom, []);
  set(organizationIdAtom, null);
  set(emailVerifiedAtom, false);
  set(authLoadingAtom, false);
  set(authErrorAtom, null);
});

// =====================
// DATA STATE ATOMS
// =====================
