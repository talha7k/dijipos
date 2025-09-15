import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationUser } from '@/types';

export function useOrganizationUsersActions(organizationId: string | undefined) {
  const [updating, setUpdating] = useState(false);

  const updateOrganizationUser = async (userId: string, updates: Partial<OrganizationUser>) => {
    if (!organizationId) return;

    setUpdating(true);
    try {
      const userRef = doc(db, 'organizationUsers', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating organization user:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    if (!organizationId) return;

    setUpdating(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isActive });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  return {
    updateOrganizationUser,
    updateUserStatus,
    updating,
  };
}