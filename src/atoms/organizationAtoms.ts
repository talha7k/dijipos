// atoms/organizationAtoms.ts
import { atom } from 'jotai';
import { Organization } from '@/types';

// Holds the full object of the currently selected organization
export const selectedOrganizationAtom = atom<Organization | null>(null);

// Holds the current user's role in the selected organization
export const CurrentUserRoleInSelectedOrganizationAtom = atom<string | null>(null);