"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  DocumentSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { Organization, User } from "@/types";
import { SubscriptionStatus } from "@/types/enums";
import { PageHeader } from "@/components/layout/PageHeader";

interface OrganizationStats {
  organization: Organization;
  creator: User;
  userCount: number;
}

const SuperAdminPage = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [newExpiryDate, setNewExpiryDate] = useState<string>("");
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("fetchUserData called, user:", user?.uid);
      if (user?.uid) {
        try {
          console.log("Checking super admin status for user:", user.uid);
          const superAdminDoc = await getDoc(doc(db, "super-admins", user.uid));
          console.log("Super admin doc exists:", superAdminDoc.exists());
          if (superAdminDoc.exists()) {
            console.log("User is super admin, fetching data");
            setIsSuperAdmin(true);

            // Fetch all organizations and their stats
            console.log("Fetching organization stats");
            setLoadingOrganizations(true);
            await fetchOrganizationStats();
            setLoadingOrganizations(false);
          } else {
            console.log("User is not a super admin");
            setIsSuperAdmin(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsSuperAdmin(false);
        } finally {
          setLoading(false);
        }
      } else if (user === null) {
        console.log("User is not logged in");
        // User is not logged in
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const fetchOrganizationStats = async () => {
    try {
      console.log("Starting to fetch organization stats");
      // Fetch all organizations
      const organizationsCollection = collection(db, "organizations");
      const organizationsSnapshot = await getDocs(organizationsCollection);
      console.log("Found organizations:", organizationsSnapshot.size);

      const orgStats: OrganizationStats[] = [];

      for (const orgDoc of organizationsSnapshot.docs) {
        console.log("Processing organization:", orgDoc.id);
        const orgData = orgDoc.data();
        const organization: Organization = {
          id: orgDoc.id,
          name: orgData.name,
          nameAr: orgData.nameAr,
          email: orgData.email,
          address: orgData.address,
          phone: orgData.phone,
          vatNumber: orgData.vatNumber,
          logoUrl: orgData.logoUrl,
          stampUrl: orgData.stampUrl,
          subscriptionStatus: orgData.subscriptionStatus,
          createdBy: orgData.createdBy,
          createdAt: orgData.createdAt, // Already a Date object
          updatedAt: orgData.updatedAt, // Already a Date object
          subscriptionExpiresAt: orgData.subscriptionExpiresAt, // Already a Date object
        } as Organization;

        // Find the creator
        let creator: User = {
          id: "unknown",
          name: "Unknown User",
          email: "unknown@example.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (organization.createdBy) {
          console.log(
            "Creator found in organization document:",
            organization.createdBy,
          );
          creator = {
            id: organization.createdBy.userId,
            name: organization.createdBy.name,
            email: organization.createdBy.email,
            isActive: true, // Assume active
            createdAt: new Date(), // Placeholder
            updatedAt: new Date(), // Placeholder
          };
        }

        // Count users in this organization
        try {
          const orgUsersQuery = query(
            collection(db, "organizationUsers"),
            where("organizationId", "==", organization.id),
            where("isActive", "==", true),
          );
          const orgUsersSnapshot = await getDocs(orgUsersQuery);
          const userCount = orgUsersSnapshot.size;
          console.log("User count for org:", userCount);

          orgStats.push({
            organization,
            creator,
            userCount,
          });
        } catch (userCountError) {
          console.error(
            "Error counting users for org:",
            organization.id,
            userCountError,
          );
          orgStats.push({
            organization,
            creator,
            userCount: 0,
          });
        }
      }

      console.log("Setting organizations state, length:", orgStats.length);
      setOrganizations(orgStats);
    } catch (error) {
      console.error("Error fetching organization stats:", error);
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const handleUpdateSubscription = async (organizationId: string) => {
    if (!newExpiryDate) {
      alert("Please select a valid date.");
      return;
    }

    try {
      const orgDocRef = doc(db, "organizations", organizationId);
      await updateDoc(orgDocRef, {
        subscriptionExpiresAt: new Date(newExpiryDate),
      });

      // Refresh the data
      await fetchOrganizationStats();
      setEditingOrg(null);
      setNewExpiryDate("");
      alert("Subscription updated successfully!");
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    }
  };



  const deleteOrganization = async (organizationId: string) => {
    if (!isSuperAdmin) {
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this organization and all its data? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingOrg(organizationId);

    try {
      // List of collections to delete data from
      const collectionsToDelete = [
        "categories",
        "currencySettings",
        "customers",
        "invitations",
        "orderTypes",
        "orders",
        "organizationUsers",
        "paymentTypes",
        "printerSettings",
        "products",
        "storeSettings",
        "vatSettings",
        "invoices",
        "quotes",
        "payments",
        "purchaseProducts",
        "purchaseServices",
        "purchaseInvoices",
        "suppliers",
        "tables",
        "templates",
      ];

      // First, scan all collections to count total documents and validate permissions
      let totalDocuments = 0;
      const collectionData: { [key: string]: DocumentSnapshot[] } = {};

      for (const collectionName of collectionsToDelete) {
        try {
          const collectionRef = collection(db, collectionName);
          const q = query(
            collectionRef,
            where("organizationId", "==", organizationId),
          );
          const snapshot = await getDocs(q);

          if (snapshot.size > 0) {
            collectionData[collectionName] = snapshot.docs;
            totalDocuments += snapshot.size;
            console.log(
              `Found ${snapshot.size} documents in ${collectionName}`,
            );
          }
        } catch (collectionError) {
          console.error(
            `Permission error accessing collection ${collectionName}:`,
            collectionError,
          );
          throw new Error(
            `Cannot access collection ${collectionName}. Check Firestore permissions.`,
          );
        }
      }

      console.log(`Total documents to delete/update: ${totalDocuments}`);

      // Collect all operations into batches for transactional execution
      const allBatches: Array<{
        type: "delete" | "update";
        collection: string;
        batch: ReturnType<typeof writeBatch>;
        count: number;
      }> = [];
      let totalOperations = 0;

      // Prepare deletion operations for each collection
      for (const collectionName of collectionsToDelete) {
        const docs = collectionData[collectionName];
        if (docs && docs.length > 0) {
          // Process in batches of 500 (Firestore limit)
          for (let i = 0; i < docs.length; i += 500) {
            const batch = writeBatch(db);
            const batchDocs = docs.slice(i, i + 500);

            batchDocs.forEach((docSnapshot: DocumentSnapshot) => {
              batch.delete(docSnapshot.ref);
            });

            allBatches.push({
              type: "delete",
              collection: collectionName,
              batch: batch,
              count: batchDocs.length,
            });
            totalOperations += batchDocs.length;
          }
        }
      }

      // Add organization document deletion as the final operation
      const orgDocRef = doc(db, "organizations", organizationId);
      const finalBatch = writeBatch(db);
      finalBatch.delete(orgDocRef);
      allBatches.push({
        type: "delete",
        collection: "organizations",
        batch: finalBatch,
        count: 1,
      });
      totalOperations += 1;

      console.log(
        `Prepared ${allBatches.length} batches with ${totalOperations} total operations`,
      );

      // Execute all batches transactionally - if any fails, we stop
      let totalExecuted = 0;
      for (let i = 0; i < allBatches.length; i++) {
        const batchOperation = allBatches[i];
        try {
          await batchOperation.batch.commit();
          totalExecuted += batchOperation.count;
          console.log(
            `Successfully executed ${batchOperation.type} batch for ${batchOperation.collection} (${batchOperation.count} operations)`,
          );
        } catch (batchError) {
          console.error(
            `CRITICAL: Failed to execute batch ${i + 1}/${allBatches.length} for ${batchOperation.collection}:`,
            batchError,
          );
          throw new Error(
            `Transaction failed during ${batchOperation.type} operation on ${batchOperation.collection}. Some data may have been deleted. Manual cleanup may be required: ${batchError instanceof Error ? batchError.message : "Unknown error"}`,
          );
        }
      }

      console.log(
        `Successfully executed all ${allBatches.length} batches transactionally. Total operations: ${totalExecuted}`,
      );

      // Refresh the data
      setLoadingOrganizations(true);
      await fetchOrganizationStats();

      alert("Organization and all related data deleted successfully!");
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert(
        `Error deleting organization: ${error instanceof Error ? error.message : "Please try again."}`,
      );
    } finally {
      setDeletingOrg(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading Super Admin Dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Access Denied
          </h2>
          <p className="text-destructive">
            You are not authorized to view this page.
          </p>
          <p className="text-sm text-destructive/80 mt-2">
            User ID: {user?.uid || "Not logged in"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto p-4 pt-20">
        <PageHeader
          title="Super Admin"
          subtitle="Manage organizations, and signups."
        />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold">Total Organizations</h3>
            <p className="text-3xl font-bold">{organizations.length}</p>
          </div>
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold">
              {organizations.reduce((sum, org) => sum + org.userCount, 0)}
            </p>
          </div>
        </div>

        {/* Organizations Table */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
            {loadingOrganizations ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading organizations...
                  </p>
                </div>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left border-b">
                      Organization
                    </th>
                    <th className="py-3 px-4 text-left border-b">
                      Created By
                    </th>
                    <th className="py-3 px-4 text-left border-b">Users</th>
                    <th className="py-3 px-4 text-left border-b">Created</th>
                    <th className="py-3 px-4 text-left border-b">Subscription Expires</th>
                    <th className="py-3 px-4 text-left border-b">Status</th>
                    <th className="py-3 px-4 text-left border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((orgStat) => (
                    <tr
                      key={orgStat.organization.id}
                      className="hover:bg-muted/50"
                    >
                      <td className="py-3 px-4 border-b">
                        <div>
                          <div className="font-medium">
                            {orgStat.organization.name}
                          </div>
                          {orgStat.organization.nameAr && (
                            <div className="text-sm text-muted-foreground">
                              {orgStat.organization.nameAr}
                            </div>
                          )}
                          {orgStat.organization.phone && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {orgStat.organization.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {orgStat.creator ? (
                          <div>
                            <div className="font-medium">
                              {orgStat.creator.name || "No Name"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {orgStat.creator.email || "No Email"}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium">Unknown User</div>
                            <div className="text-sm text-muted-foreground">
                              Data not available
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                          {orgStat.userCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {formatDate(orgStat.organization.createdAt)}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {editingOrg === orgStat.organization.id ? (
                          <div className="flex items-center">
                            <input
                              type="date"
                              value={newExpiryDate}
                              onChange={(e) => setNewExpiryDate(e.target.value)}
                              className="bg-input border border-border rounded-md p-1 text-sm"
                            />
                            <button
                              onClick={() => handleUpdateSubscription(orgStat.organization.id)}
                              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-1 px-2 rounded text-sm ml-2"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingOrg(null)}
                              className="bg-muted hover:bg-muted/90 text-muted-foreground font-medium py-1 px-2 rounded text-sm ml-1"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span>
                              {orgStat.organization.subscriptionExpiresAt
                                ? formatDate(
                                    orgStat.organization.subscriptionExpiresAt,
                                  )
                                : "N/A"}
                            </span>
                            <button
                              onClick={() => {
                                setEditingOrg(orgStat.organization.id);
                                setNewExpiryDate(
                                  orgStat.organization.subscriptionExpiresAt
                                    ? orgStat.organization.subscriptionExpiresAt
                                        .toISOString()
                                        .split("T")[0]
                                    : "",
                                );
                              }}
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-1 px-2 rounded text-sm ml-2"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            orgStat.organization.subscriptionStatus ===
                            SubscriptionStatus.ACTIVE
                              ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {orgStat.organization.subscriptionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <button
                          onClick={() =>
                            deleteOrganization(orgStat.organization.id)
                          }
                          disabled={deletingOrg === orgStat.organization.id}
                          className="bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 text-destructive-foreground font-medium py-1 px-3 rounded text-sm"
                        >
                          {deletingOrg === orgStat.organization.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
