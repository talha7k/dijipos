import { addDoc, collection, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrganizationUser, UserRole } from '@/types';

export function useOrganizationUsersActions(organizationId: string | undefined) {
  const updateUser = async (userId: string, updates: Partial<OrganizationUser>) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const userRef = doc(db, 'organizations', organizationId, 'organizationUsers', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const updateOrganizationUser = async (userId: string, updates: Partial<OrganizationUser>) => {
    return updateUser(userId, updates);
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const userRef = doc(db, 'organizations', organizationId, 'organizationUsers', userId);
    await updateDoc(userRef, {
      isActive: !isActive,
      updatedAt: new Date(),
    });
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    return toggleUserStatus(userId, isActive);
  };

  const deleteUser = async (userId: string) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const userRef = doc(db, 'organizations', organizationId, 'organizationUsers', userId);
    await deleteDoc(userRef);
  };

  return {
    updateUser,
    updateOrganizationUser,
    toggleUserStatus,
    updateUserStatus,
    deleteUser,
  };
}