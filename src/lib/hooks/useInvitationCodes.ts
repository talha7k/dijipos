import { useState, useEffect } from 'react';
import { InvitationCode, OrganizationUser } from '@/types';
import { getInvitationCodes, createInvitationCode, deleteInvitationCode } from '../firebase/firestore/invitations';
import { UserRole } from '@/types/enums';

interface UseInvitationCodesDataResult {
  invitationCodes: InvitationCode[];
  loading: boolean;
  error: string | null;
}

interface UseInvitationCodesActionsResult {
  createInvitationCodeSimple: (role: UserRole, expiresAt: Date) => Promise<void>;
  deleteInvitationCode: (codeId: string) => Promise<void>;
}

/**
 * Hook to fetch invitation codes for an organization
 */
export function useInvitationCodesData(organizationId: string | undefined): UseInvitationCodesDataResult {
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setInvitationCodes([]);
      setLoading(false);
      return;
    }

    const fetchInvitationCodes = async () => {
      setLoading(true);
      setError(null);
      try {
        const codes = await getInvitationCodes(organizationId);
        setInvitationCodes(codes);
      } catch (err) {
        setError('Failed to fetch invitation codes');
        console.error('Error fetching invitation codes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationCodes();
  }, [organizationId]);

  return {
    invitationCodes,
    loading,
    error,
  };
}

/**
 * Hook to provide actions for invitation codes
 */
export function useInvitationCodesActions(organizationId: string | undefined): UseInvitationCodesActionsResult {
  const createInvitationCodeSimple = async (role: UserRole, expiresAt: Date): Promise<void> => {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    try {
      await createInvitationCode(organizationId, role, expiresAt);
    } catch (error) {
      console.error('Error creating invitation code:', error);
      throw error;
    }
  };

  const deleteInvitationCodeAction = async (codeId: string): Promise<void> => {
    try {
      await deleteInvitationCode(codeId);
    } catch (error) {
      console.error('Error deleting invitation code:', error);
      throw error;
    }
  };

  return {
    createInvitationCodeSimple,
    deleteInvitationCode: deleteInvitationCodeAction,
  };
}