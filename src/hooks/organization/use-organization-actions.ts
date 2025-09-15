import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types';

export function useOrganizationActions(organizationId: string | undefined) {
  const [updating, setUpdating] = useState(false);

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!organizationId) return;

    setUpdating(true);
    try {
      const organizationRef = doc(db, 'organizations', organizationId);
      await updateDoc(organizationRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const updateOrganizationBranding = async (logoUrl: string | null, stampUrl: string | null) => {
    if (!organizationId) return;

    setUpdating(true);
    try {
      const organizationRef = doc(db, 'organizations', organizationId);
      await updateDoc(organizationRef, {
        logoUrl,
        stampUrl,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating organization branding:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateOrganization,
    updateOrganizationBranding,
    updating,
  };
}