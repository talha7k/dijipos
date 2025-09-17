// atoms/organizationAtoms.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { indexedDBStorage } from '@/lib/storage'; // Using the IndexedDB storage we created

// --- Core State Atoms ---

// Persists the user's last selected organization ID to IndexedDB
export const selectedOrganizationIdAtom = atomWithStorage<string | null>(
  'selectedOrgId',
  null,
  indexedDBStorage
);

// Holds the current user's role in the selected organization
export const CurrentUserRoleInSelectedOrganizationAtom = atom<string | null>(null);