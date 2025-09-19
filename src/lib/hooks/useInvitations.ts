import { useState, useEffect } from "react";
import { Invitation, OrganizationUser } from "@/types";
import {
  getInvitations,
  createInvitation,
  deleteInvitation,
} from "../firebase/firestore/invitations";
import { UserRole } from "@/types/enums";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

interface UseInvitationsDataResult {
  invitationCodes: Invitation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseInvitationsActionsResult {
  createInvitationSimple: (role: UserRole, expiresAt: Date) => Promise<void>;
  deleteInvitation: (codeId: string) => Promise<void>;
  validateAndUseInvitation: (
    code: string,
    userId: string,
  ) => Promise<{
    success: boolean;
    organizationId?: string;
    role?: UserRole;
    error?: string;
  }>;
}

/**
 * Hook to fetch invitation codes for an organization
 */
export function useInvitationsData(
  organizationId: string | undefined,
): UseInvitationsDataResult {
  const [invitationCodes, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      setLoading(true);
      setError(null);
      try {
        const codes = await getInvitations(organizationId);
        setInvitations(codes);
      } catch (err) {
        setError("Failed to fetch invitation codes");
        console.error("Error fetching invitation codes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [organizationId]);

  const refetch = async () => {
    if (!organizationId) {
      setInvitations([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const codes = await getInvitations(organizationId);
      setInvitations(codes);
    } catch (err) {
      setError("Failed to fetch invitation codes");
      console.error("Error fetching invitation codes:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    invitationCodes,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to provide actions for invitation codes
 */
export function useInvitationsActions(
  organizationId: string | undefined,
  refetch?: () => Promise<void>,
): UseInvitationsActionsResult {
  const createInvitationSimple = async (
    role: UserRole,
    expiresAt: Date,
  ): Promise<void> => {
    if (!organizationId) {
      throw new Error("Organization ID is required");
    }

    try {
      await createInvitation(organizationId, role, expiresAt);
      // Refetch data after successful creation
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Error creating invitation code:", error);
      throw error;
    }
  };

  const deleteInvitationAction = async (codeId: string): Promise<void> => {
    try {
      await deleteInvitation(codeId);
      // Refetch data after successful deletion
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      console.error("Error deleting invitation code:", error);
      throw error;
    }
  };

  const useInvitation = async (
    code: string,
    userId: string,
  ): Promise<{
    success: boolean;
    organizationId?: string;
    role?: UserRole;
    error?: string;
  }> => {
    try {
      console.log(
        "useInvitation: Validating code:",
        code.toLowerCase(),
        "for user:",
        userId,
      );

      // Find the invitation code
      const codesQuery = query(
        collection(db, "invitations"),
        where("code", "==", code.toLowerCase()),
      );
      const codesSnapshot = await getDocs(codesQuery);

      // Filter by isUsed in code to avoid composite index issues
      const availableCodes = codesSnapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.isUsed === false;
      });

      if (availableCodes.length === 0) {
        console.log("useInvitation: No available invitation codes found");
        return { success: false, error: "Invalid or expired invitation code" };
      }

      const invitationCode = availableCodes[0].data();
      const codeId = availableCodes[0].id;

      console.log("useInvitation: Found invitation code:", {
        id: codeId,
        code: invitationCode.code,
        organizationId: invitationCode.organizationId,
        role: invitationCode.role,
        isUsed: invitationCode.isUsed,
        expiresAt: invitationCode.expiresAt?.toDate(),
        createdAt: invitationCode.createdAt?.toDate(),
      });

      // Check if code is expired
      const expiresAt = invitationCode.expiresAt?.toDate();
      const now = new Date();
      if (expiresAt && expiresAt < now) {
        console.log("useInvitation: Code has expired");
        return { success: false, error: "Invitation code has expired" };
      }

      // Check if user is already a member
      console.log(
        "useInvitation: Checking if user is already a member of organization:",
        invitationCode.organizationId,
      );
      const existingMembershipQuery = query(
        collection(db, "organizationUsers"),
        where("userId", "==", userId),
        where("organizationId", "==", invitationCode.organizationId),
      );
      const existingMembershipSnapshot = await getDocs(existingMembershipQuery);

      if (!existingMembershipSnapshot.empty) {
        console.log(
          "useInvitation: User is already a member of this organization",
        );
        return {
          success: false,
          error: "You are already a member of this organization",
        };
      }

      // Add user to organization
      await addDoc(collection(db, "organizationUsers"), {
        userId,
        organizationId: invitationCode.organizationId,
        role: invitationCode.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Mark invitation code as used
      const codeDocRef = doc(db, "invitations", codeId);
      await updateDoc(codeDocRef, {
        isUsed: true,
        usedBy: userId,
        usedAt: serverTimestamp(),
      });

      console.log("useInvitation: Successfully joined organization!");
      return {
        success: true,
        organizationId: invitationCode.organizationId,
        role: invitationCode.role,
      };
    } catch (error) {
      console.error("useInvitation: Error joining organization:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to join organization. Please check the code and try again.";
      return { success: false, error: errorMessage };
    }
  };

  return {
    createInvitationSimple,
    deleteInvitation: deleteInvitationAction,
    validateAndUseInvitation: useInvitation,
  };
}
