import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
  selectedOrganizationAtom, 
  organizationLoadingAtom, 
  organizationErrorAtom 
} from '@/store/atoms';
import { Organization } from '@/types';

export function useOrganizationState() {
  const [selectedOrganization, setSelectedOrganization] = useAtom(selectedOrganizationAtom);
  const [organizationLoading, setOrganizationLoading] = useAtom(organizationLoadingAtom);
  const [organizationError, setOrganizationError] = useAtom(organizationErrorAtom);

  const selectOrganization = (organization: Organization | null) => {
    setSelectedOrganization(organization);
    if (organization) {
      localStorage.setItem('selectedOrganizationId', organization.id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  const clearOrganization = () => {
    setSelectedOrganization(null);
    setOrganizationError(null);
    localStorage.removeItem('selectedOrganizationId');
  };

  return {
    selectedOrganization,
    organizationLoading,
    organizationError,
    setSelectedOrganization: selectOrganization,
    setOrganizationLoading,
    setOrganizationError,
    clearOrganization,
  };
}

// Read-only hooks for optimization
export function useSelectedOrganization() {
  return useAtomValue(selectedOrganizationAtom);
}

export function useOrganizationLoading() {
  return useAtomValue(organizationLoadingAtom);
}

export function useSetOrganizationState() {
  return useSetAtom(selectedOrganizationAtom);
}