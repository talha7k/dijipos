"use client";

import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

import { useOrganizationManager } from "@/lib/hooks/useOrganization";
import {
  selectedOrganizationAtom,
  userOrganizationsAtom,
  organizationLoadingAtom,
  organizationErrorAtom,
  selectedOrganizationIdAtom,
  organizationUserRoleAtom,
  logoutAtom,
} from "@/atoms";
import { ReactNode } from "react";
import { autoRepairIndexedDB } from "@/lib/debug-indexeddb";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [selectedOrganization, setSelectedOrganization] = useAtom(
    selectedOrganizationAtom,
  );
  const [userOrganizations, setUserOrganizations] = useAtom(
    userOrganizationsAtom,
  );
  const [organizationLoading, setOrganizationLoading] = useAtom(
    organizationLoadingAtom,
  );
  const [organizationError, setOrganizationError] = useAtom(
    organizationErrorAtom,
  );
  const [organizationId, setOrganizationId] = useAtom(
    selectedOrganizationIdAtom,
  );
  const [organizationUserRole, setOrganizationUserRole] = useAtom(
    organizationUserRoleAtom,
  );
  const logout = useSetAtom(logoutAtom);

  // Initialize organization management - only once in the app lifecycle
  useOrganizationManager();

  // Flag to prevent multiple simultaneous auth operations
  const authProcessingRef = useRef(false);

  // Log when organizationLoading changes
  useEffect(() => {
    console.log(
      "AuthProvider: organizationLoading changed to",
      organizationLoading,
    );
  }, [organizationLoading]);

  // Initialize IndexedDB auto-repair on component mount
  useEffect(() => {
    const initializeIndexedDB = async () => {
      try {
        await autoRepairIndexedDB();
      } catch (error) {
        console.error("IndexedDB auto-repair failed:", error);
      }
    };

    initializeIndexedDB();
  }, []);

  // Initialize auth state listener - only once
  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    console.log("AuthProvider: Firebase auth object:", auth);
    console.log("AuthProvider: Firebase app initialized:", auth.app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "AuthProvider: Auth state changed, user:",
        user?.email || "null",
      );
      console.log("AuthProvider: User object:", user);

      // Prevent multiple simultaneous auth operations
      if (authProcessingRef.current) {
        console.log(
          "AuthProvider: Auth already processing, skipping duplicate call",
        );
        return;
      }

      authProcessingRef.current = true;

      // Handle auth state change asynchronously
      (async () => {
        try {
          if (user) {
            // AuthProvider only handles authentication
            // Organization loading is handled by useOrganizationManager
            console.log("AuthProvider: User authenticated");
          } else {
            console.log("AuthProvider: No user, clearing state");
            logout();
          }

          // Auth processing is complete
          authProcessingRef.current = false;
          console.log("AuthProvider: Auth process finished");
        } catch (err) {
          console.error("Auth state change error:", err);
          // Auth processing is complete
          authProcessingRef.current = false;
        }
      })();
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth state listener");
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
