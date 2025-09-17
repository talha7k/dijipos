import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { InvitationCode, UserRole } from '@/types';

// Collection references
const invitationsRef = collection(db, 'invitations');

/**
 * Create a new invitation code
 */
export async function createInvitationCode(
  organizationId: string,
  role: UserRole,
  expiresAt: Date
): Promise<string> {
  try {
    // Generate a unique code (you might want to use a more sophisticated method)
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const now = Timestamp.now();
    const docRef = await addDoc(invitationsRef, {
      code,
      organizationId,
      role,
      expiresAt: Timestamp.fromDate(expiresAt),
      isUsed: false,
      createdAt: now,
    });

    return code;
  } catch (error) {
    console.error('Error creating invitation code:', error);
    throw error;
  }
}

/**
 * Validate an invitation code
 */
export async function validateInvitationCode(code: string): Promise<InvitationCode | null> {
  try {
    // NOTE: This query requires a composite index on (code, isUsed)
    const invitationQuery = query(
      invitationsRef,
      where('code', '==', code),
      where('isUsed', '==', false)
    );
    const snapshot = await getDocs(invitationQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check if expired
    const expiresAt = data.expiresAt?.toDate();
    if (expiresAt && expiresAt < new Date()) {
      return null;
    }

    return {
      id: doc.id,
      ...data,
      expiresAt: expiresAt || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as InvitationCode;
  } catch (error) {
    console.error('Error validating invitation code:', error);
    throw error;
  }
}

/**
 * Use an invitation code (mark as used)
 */
export async function useInvitationCode(code: string, usedBy: string): Promise<InvitationCode | null> {
  try {
    const invitation = await validateInvitationCode(code);
    if (!invitation) {
      return null;
    }

    // Mark as used
    const docRef = doc(invitationsRef, invitation.id);
    await updateDoc(docRef, {
      isUsed: true,
      usedBy,
    });

    return {
      ...invitation,
      isUsed: true,
      usedBy,
    };
  } catch (error) {
    console.error('Error using invitation code:', error);
    throw error;
  }
}

/**
 * Get all invitation codes for an organization
 */
export async function getInvitationCodes(organizationId: string): Promise<InvitationCode[]> {
  try {
    const invitationQuery = query(
      invitationsRef,
      where('organizationId', '==', organizationId)
    );
    const snapshot = await getDocs(invitationQuery);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        expiresAt: data.expiresAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      } as InvitationCode;
    });
  } catch (error) {
    console.error('Error fetching invitation codes:', error);
    throw error;
  }
}

/**
 * Delete an invitation code
 */
export async function deleteInvitationCode(invitationId: string): Promise<void> {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const docRef = doc(invitationsRef, invitationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting invitation code:', error);
    throw error;
  }
}