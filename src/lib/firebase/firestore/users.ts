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
import { User, OrganizationUser, Organization } from '@/types';

// Collection references
const usersRef = collection(db, 'users');
const organizationUsersRef = collection(db, 'organizationUsers');

/**
 * Get a user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(usersRef, userId));
    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();
    return {
      id: userDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user profile
 */
export async function createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(usersRef, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update a user profile
 */
export async function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
  try {
    const docRef = doc(usersRef, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Get organization user relationship
 */
export async function getOrganizationUser(organizationId: string, userId: string): Promise<OrganizationUser | null> {
  try {
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(orgUsersQuery);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as OrganizationUser;
  } catch (error) {
    console.error('Error fetching organization user:', error);
    throw error;
  }
}

/**
 * Get all users in an organization with their profiles
 */
export async function getUsersInOrganization(organizationId: string): Promise<(User & { organizationRole: OrganizationUser['role'] })[]> {
  try {
    // First get organization user relationships
    const orgUsersQuery = query(
      organizationUsersRef,
      where('organizationId', '==', organizationId),
      where('isActive', '==', true)
    );
    const orgUsersSnapshot = await getDocs(orgUsersQuery);

    if (orgUsersSnapshot.empty) {
      return [];
    }

    // Get user IDs
    const userIds = orgUsersSnapshot.docs.map(doc => doc.data().userId);
    const userRoles = new Map(
      orgUsersSnapshot.docs.map(doc => [doc.data().userId, doc.data().role])
    );

    // Fetch user profiles
    const users: (User & { organizationRole: OrganizationUser['role'] })[] = [];
    for (const userId of userIds) {
      const userDoc = await getDoc(doc(usersRef, userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        users.push({
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          organizationRole: userRoles.get(userId),
        } as User & { organizationRole: OrganizationUser['role'] });
      }
    }

    return users;
  } catch (error) {
    console.error('Error fetching users in organization:', error);
    throw error;
  }
}

/**
 * Get all organizations for a user (with roles)
 */
export async function getUserOrganizations(userId: string): Promise<(OrganizationUser & { organization?: Organization })[]> {
  try {
    const orgUsersQuery = query(
      organizationUsersRef,
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(orgUsersQuery);

    const organizationUsers = snapshot.docs.map(doc => {
      const data = doc.data() as OrganizationUser;
      const { createdAt, updatedAt, ...dataWithoutDates } = data; // Exclude the original id field
      return {
        ...dataWithoutDates,
        id: doc.id,
        createdAt: createdAt instanceof Date ? createdAt : new Date(),
        updatedAt: updatedAt instanceof Date ? updatedAt : new Date(),
      };
    });

    // Optionally fetch organization details
    // For now, just return the relationships
    return organizationUsers;
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    throw error;
  }
}