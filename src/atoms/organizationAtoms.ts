// atoms/organizationAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Organization, OrganizationUser } from '@/types'; //
import { indexedDBStorage } from '@/lib/storage'; // Using the IndexedDB storage we created

// --- Core State Atoms ---

// Persists the user's last selected organization ID to IndexedDB
export const selectedOrganizationIdAtom = atomWithStorage<string | null>(
  'selectedOrgId',
  null,
  indexedDBStorage
);

// Holds the full object of the currently selected organization
export const selectedOrganizationAtom = atom<Organization | null>(null);

// Holds the list of all organizations the current user is a member of
export const userOrganizationsAtom = atom<Organization[]>([]);

// Holds the list of user-organization associations with roles
export const userOrganizationAssociationsAtom = atom<Array<{organizationId: string, role: string, isActive: boolean}>>([]);

// Holds the real-time list of users for the selected organization
export const organizationUsersAtom = atom<OrganizationUser[]>([]);


// --- Status Atoms ---

// Manages any potential errors
export const organizationErrorAtom = atom<string | null>(null);