import { collection, doc } from 'firebase/firestore';
import { useAddDocumentMutation, useDeleteDocumentMutation } from '@tanstack-query-firebase/react/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/types';

export function useInvitationCodesActions(organizationId: string | undefined) {
  const addInvitationCodeMutation = useAddDocumentMutation(
    collection(db, 'organizations', organizationId || 'dummy', 'invitationCodes')
  );
  
  const deleteInvitationCodeMutation = useDeleteDocumentMutation(
    doc(db, 'organizations', organizationId || 'dummy', 'invitationCodes', 'dummy')
  );

  const createInvitationCode = async (invitationData: {
    code: string;
    role: UserRole;
    expiresAt: Date;
  }) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const invitationCode = {
      organizationId,
      ...invitationData,
      isUsed: false,
      createdAt: new Date(),
    };

    const docRef = await addInvitationCodeMutation.mutateAsync(invitationCode);
    return docRef.id;
  };

  const createInvitationCodeSimple = async (role: string, expiresAt: Date) => {
    // Generate a random code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return createInvitationCode({
      code,
      role: role as UserRole,
      expiresAt,
    });
  };

  const deleteInvitationCode = async (codeId: string) => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const codeRef = doc(db, 'organizations', organizationId, 'invitationCodes', codeId);
    await deleteInvitationCodeMutation.mutateAsync();
  };

  return {
    createInvitationCode,
    createInvitationCodeSimple,
    deleteInvitationCode,
  };
}