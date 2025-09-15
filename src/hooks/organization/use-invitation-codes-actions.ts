import { useState } from 'react';
import { doc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InvitationCode } from '@/types';

export function useInvitationCodesActions(organizationId: string | undefined) {
  const [loading, setLoading] = useState(false);

  const generateInvitationCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createInvitationCode = async (role: 'admin' | 'manager' | 'waiter' | 'cashier', expiresAt: Date) => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const code = generateInvitationCode();
      await addDoc(collection(db, 'invitationCodes'), {
        code,
        organizationId,
        role,
        expiresAt,
        isUsed: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating invitation code:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitationCode = async (codeId: string) => {
    if (!organizationId) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'invitationCodes', codeId));
    } catch (error) {
      console.error('Error deleting invitation code:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvitationCode,
    deleteInvitationCode,
    loading,
  };
}