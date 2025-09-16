import { doc } from 'firebase/firestore';
import { useUpdateDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { OrganizationUser, UserRole } from '@/types';

export function useOrganizationUsersActions(organizationId: string | undefined) {
  const updateUserMutation = useUpdateDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'organizationUsers', 'dummy')
  );
  
  const deleteUserMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'organizationUsers', 'dummy')
  );

  const updateUser = async (userId: string, updates: Partial<OrganizationUser>) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const userRef = doc(db, 'organizations', organizationId, 'organizationUsers', userId);
    await updateUserMutation.mutateAsync({
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
    await updateUserMutation.mutateAsync({
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
    await deleteUserMutation.mutateAsync();
  };

  return {
    updateUser,
    updateOrganizationUser,
    toggleUserStatus,
    updateUserStatus,
    deleteUser,
  };
}