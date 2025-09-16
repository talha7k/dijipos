import { doc } from 'firebase/firestore';
import { useUpdateDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

export function useOrganizationActions(organizationId: string | undefined) {
  const updateOrganizationMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy')
  );

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organizationId) return;

    try {
      await updateOrganizationMutation.mutateAsync({
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  };

  const updateOrganizationBranding = async (logoUrl: string | null, stampUrl: string | null) => {
    if (!organizationId) return;

    try {
      await updateOrganizationMutation.mutateAsync({
        logoUrl,
        stampUrl,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating organization branding:', error);
      throw error;
    }
  };

  return {
    updateOrganization,
    updateOrganizationBranding,
    updating: updateOrganizationMutation.isPending,
  };
}