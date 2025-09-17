// atoms/index.ts

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Organization, OrganizationUser, UserRole } from '@/types';
import { indexedDBStorage } from '@/lib/storage';

// Re-export atoms from more specific files
export * from './posAtoms';
export * from './uiAtoms';

// ==========================================
// ORGANIZATION & SESSION STATE ATOMS
// ==========================================

// --- CORE STATE ---

// This is the SINGLE SOURCE OF TRUTH for which organization is active.
// It is persisted to IndexedDB to remember the user's choice across sessions.
export const selectedOrganizationIdAtom = atomWithStorage<string | null>(
  'selectedOrgId', 
  null, 
  indexedDBStorage
);

// This atom holds the full object for the selected organization.
// It is populated by the useOrganizationManager hook based on the ID above.
export const selectedOrganizationAtom = atom<Organization | null>(null);

// This atom holds the list of ALL organizations the user is a member of.
// This is used to populate the organization switcher/dropdown.
export const userOrganizationsAtom = atom<Organization[]>([]);

// This atom holds the user's role and details for the currently selected organization.
export const organizationUserRoleAtom = atom<OrganizationUser | null>(null);

// This atom holds the user's associations with organizations (roles, etc.)
export const userOrganizationAssociationsAtom = atom<{ organizationId: string; role: UserRole; isActive: boolean }[]>([]);

// This atom holds the users in the currently selected organization
export const organizationUsersAtom = atom<OrganizationUser[]>([]);


// --- STATUS ATOMS ---

// Separate loading states to prevent race conditions
export const organizationsLoadingAtom = atom<boolean>(false); // Loading user's organizations list
export const organizationDetailsLoadingAtom = atom<boolean>(false); // Loading selected organization details
export const organizationLoadingAtom = atom<boolean>(false); // Combined loading state (for backward compatibility)
export const organizationErrorAtom = atom<string | null>(null);


// ==========================================
// DERIVED ATOMS
// ==========================================
// These atoms derive their value from other atoms. They are very efficient.

// Checks if an organization has been selected by the user.
export const hasSelectedOrganizationAtom = atom((get) => get(selectedOrganizationIdAtom) !== null);

// Checks if the user is a member of any organizations at all.
export const isMemberOfAnyOrganizationAtom = atom((get) => get(userOrganizationsAtom).length > 0);


// ==========================================
// UTILITY ATOMS
// ==========================================

// A write-only atom to handle the "logout" action, clearing all session state.
export const logoutAtom = atom(null, (get, set) => {
  // We don't touch the Firebase user here, we just clear our app's session state.
  // The useAuth hook will reflect the change when Firebase confirms the logout.
  set(selectedOrganizationIdAtom, null);
  set(selectedOrganizationAtom, null);
  set(userOrganizationsAtom, []);
  set(organizationUserRoleAtom, null);
});