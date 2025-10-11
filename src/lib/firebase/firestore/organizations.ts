import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Organization, OrganizationUser, UserRole } from '@/types';

// Collection references
const organizationsRef = collection(db, 'organizations');
const organizationUsersRef = collection(db, 'organizationUsers');

/**
 * Fetch all organizations for a user
 */
export async function getOrganizationsForUser(userId: string): Promise<Organization[]> {
  try {
    // First get organization user associations
    // NOTE: This query requires a composite index on (userId, isActive)
    // Create it at: https://console.firebase.google.com/v1/r/project/dijipos-27e3a/firestore/indexes
    const orgUsersQuery = query(
      organizationUsersRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const orgUsersSnapshot = await getDocs(orgUsersQuery);

    if (orgUsersSnapshot.empty) {
      return [];
    }

    // Get organization IDs
    const organizationIds = orgUsersSnapshot.docs.map(doc => doc.data().organizationId);

    // Fetch organizations
    const organizations: Organization[] = [];
    for (const orgId of organizationIds) {
      const orgDoc = await getDoc(doc(organizationsRef, orgId));
      if (orgDoc.exists()) {
        const data = orgDoc.data();
        organizations.push({
          id: orgDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Organization);
      }
    }

    return organizations;
  } catch (error) {
    console.error('Error fetching organizations for user:', error);
    throw error;
  }
}

/**
 * Get a single organization by ID
 */
export async function getOrganization(organizationId: string): Promise<Organization | null> {
  try {
    const orgDoc = await getDoc(doc(organizationsRef, organizationId));
    if (!orgDoc.exists()) {
      return null;
    }

    const data = orgDoc.data();
    return {
      id: orgDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      subscriptionExpiresAt: data.subscriptionExpiresAt?.toDate(),
    } as Organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    throw error;
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(organizationsRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
}

/**
 * Update an organization
 */
export async function updateOrganization(organizationId: string, updates: Partial<Omit<Organization, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(organizationsRef, organizationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
}

/**
 * Update organization branding (logo and stamp)
 */
export async function updateOrganizationBranding(organizationId: string, logoUrl: string, stampUrl: string): Promise<void> {
  try {
    const docRef = doc(organizationsRef, organizationId);
    await updateDoc(docRef, {
      logoUrl,
      stampUrl,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating organization branding:', error);
    throw error;
  }
}

/**
 * Delete an organization
 */
export async function deleteOrganization(organizationId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete organization document
    batch.delete(doc(organizationsRef, organizationId));

    // Delete all organization user associations
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId)
    );
    const orgUsersSnapshot = await getDocs(orgUsersQuery);
    orgUsersSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting organization:', error);
    throw error;
  }
}

/**
 * Add a user to an organization
 */
export async function addUserToOrganization(
  organizationId: string,
  userId: string,
  role: UserRole
): Promise<string> {
  try {
    // Check if user is already in organization
    // NOTE: This query requires a composite index on (organizationId, userId)
    const existingQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('userId', '==', userId)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      // Update existing association
      const existingDoc = existingSnapshot.docs[0];
      await updateDoc(existingDoc.ref, {
        role,
        isActive: true,
        updatedAt: Timestamp.now(),
      });
      return existingDoc.id;
    }

    // Create new association
    const now = Timestamp.now();
    const docRef = await addDoc(organizationUsersRef, {
      organizationId,
      userId,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding user to organization:', error);
    throw error;
  }
}

/**
 * Update user role in organization
 */
export async function updateUserRole(
  organizationId: string,
  userId: string,
  role: UserRole
): Promise<void> {
  try {
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(orgUsersQuery);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        role,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Update organization user (role and status)
 */
export async function updateOrganizationUser(
  organizationUserId: string,
  updates: { role?: UserRole; isActive?: boolean }
): Promise<void> {
  try {
    const docRef = doc(organizationUsersRef, organizationUserId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating organization user:', error);
    throw error;
  }
}

/**
 * Update user status in organization
 */
export async function updateUserStatus(
  organizationUserId: string,
  isActive: boolean
): Promise<void> {
  try {
    const docRef = doc(organizationUsersRef, organizationUserId);
    await updateDoc(docRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

/**
 * Remove user from organization (soft delete)
 */
export async function removeUserFromOrganization(
  organizationId: string,
  userId: string
): Promise<void> {
  try {
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(orgUsersQuery);

    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error removing user from organization:', error);
    throw error;
  }
}

/**
 * Get all users in an organization
 */
export async function getOrganizationUsers(organizationId: string): Promise<OrganizationUser[]> {
  try {
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(orgUsersQuery);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as OrganizationUser[];
  } catch (error) {
    console.error('Error fetching organization users:', error);
    throw error;
  }
}