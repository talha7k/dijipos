"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  query,
  where,
  writeBatch,
  DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Organization, User } from "@/types";
import { SubscriptionStatus } from "@/types/enums";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrgCreationCode {
  id: string;
  code: string;
  createdAt: Timestamp;
  used: boolean;
  usedBy: string | null;
  userName: string | null;
  userEmail: string | null;
  usedAt: Timestamp | null;
  organizationId: string | null;
}

interface OrganizationStats {
  organization: Organization;
  creator: User;
  userCount: number;
}

const SuperAdminPage = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<OrgCreationCode[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
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

            // Fetch organization creation codes
            console.log("Fetching organization creation codes");
            const codesCollection = collection(
              db,
              "organization-creation-codes",
            );
            const codesSnapshot = await getDocs(codesCollection);
            console.log("Codes snapshot size:", codesSnapshot.size);
            const codesList = codesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as OrgCreationCode[];
            setCodes(codesList);
            console.log("Codes set, length:", codesList.length);

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
          ...orgData,
          createdAt: orgData.createdAt?.toDate() || new Date(),
          updatedAt: orgData.updatedAt?.toDate() || new Date(),
        } as Organization;

        // Find the creator from organization creation codes
        let creator: User = {
          id: "unknown",
          name: "Unknown User",
          email: "unknown@example.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        try {
          const codeQuery = query(
            collection(db, "organization-creation-codes"),
            where("organizationId", "==", organization.id),
            where("used", "==", true),
          );
          const codeSnapshot = await getDocs(codeQuery);
          console.log("Found creation codes for org:", codeSnapshot.size);

          if (!codeSnapshot.empty) {
            const codeData = codeSnapshot.docs[0].data();
            console.log("Code data:", codeData);

            if (codeData.usedBy) {
              console.log(
                "Creating creator from stored code data for UID:",
                codeData.usedBy,
              );

              // Use the stored user name and email from the creation code
              creator = {
                id: codeData.usedBy,
                name:
                  codeData.userName ||
                  `User ${codeData.usedBy.substring(0, 8)}...`,
                email:
                  codeData.userEmail ||
                  `user-${codeData.usedBy.substring(0, 8)}@example.com`,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              } as User;
              console.log(
                "Creator created from stored code data:",
                creator.name,
                creator.email,
              );
            } else {
              console.log(
                "No usedBy field in code data for org:",
                organization.id,
              );
            }
          } else {
            console.log("No creation codes found for org:", organization.id);
          }
        } catch (creatorError) {
          console.error(
            "Error fetching creator for org:",
            organization.id,
            creatorError,
          );
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

  const generateCode = async () => {
    console.log("generateCode called, isSuperAdmin:", isSuperAdmin);
    if (!isSuperAdmin) {
      console.log("User is not super admin, returning");
      return;
    }

    setGeneratingCode(true);
    try {
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      console.log("Generated code:", newCode);
      const codesCollection = collection(db, "organization-creation-codes");
      console.log("Collection reference created");

      const docRef = await addDoc(codesCollection, {
        code: newCode,
        createdAt: serverTimestamp(),
        used: false,
        usedBy: null,
        userName: null,
        userEmail: null,
        usedAt: null,
        organizationId: null,
      });
      console.log("Document added with ID:", docRef.id);

      // Refresh the list of codes
      const codesSnapshot = await getDocs(codesCollection);
      console.log("Codes snapshot size:", codesSnapshot.size);
      const codesList = codesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrgCreationCode[];
      setCodes(codesList);
      console.log("Codes state updated");
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setGeneratingCode(false);
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

      // Also check organization-creation-codes
      try {
        const codesCollection = collection(db, "organization-creation-codes");
        const codesQuery = query(
          codesCollection,
          where("organizationId", "==", organizationId),
        );
        const codesSnapshot = await getDocs(codesQuery);

        if (!codesSnapshot.empty) {
          collectionData["organization-creation-codes"] = codesSnapshot.docs;
          console.log(
            `Found ${codesSnapshot.size} organization creation codes`,
          );
        }
      } catch (codesError) {
        console.error(
          "Error accessing organization creation codes:",
          codesError,
        );
        throw new Error(
          "Cannot access organization creation codes. Check Firestore permissions.",
        );
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

      // Prepare update operations for organization-creation-codes
      const codeDocs = collectionData["organization-creation-codes"];
      if (codeDocs && codeDocs.length > 0) {
        const batch = writeBatch(db);
        codeDocs.forEach((docSnapshot: DocumentSnapshot) => {
          batch.update(docSnapshot.ref, {
            organizationId: null,
            used: false,
            usedBy: null,
            userName: null,
            userEmail: null,
            usedAt: null,
          });
        });
        allBatches.push({
          type: "update",
          collection: "organization-creation-codes",
          batch: batch,
          count: codeDocs.length,
        });
        totalOperations += codeDocs.length;
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

      // Refresh codes list
      const codesCollection = collection(db, "organization-creation-codes");
      const codesSnapshot = await getDocs(codesCollection);
      const codesList = codesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as OrgCreationCode[];
      setCodes(codesList);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold">Active Codes</h3>
            <p className="text-3xl font-bold">
              {codes.filter((c) => !c.used).length}
            </p>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="codes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="codes">Generated Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Codes</h2>
              <button
                onClick={generateCode}
                disabled={generatingCode}
                className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-foreground font-medium py-2 px-4 rounded"
              >
                {generatingCode ? "Generating..." : "Generate New Code"}
              </button>
            </div>
            <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-3 px-4 text-left border-b">Code</th>
                    <th className="py-3 px-4 text-left border-b">Created At</th>
                    <th className="py-3 px-4 text-left border-b">Used</th>
                    <th className="py-3 px-4 text-left border-b">Used By</th>
                    <th className="py-3 px-4 text-left border-b">Used At</th>
                    <th className="py-3 px-4 text-left border-b">
                      Organization
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c: OrgCreationCode) => (
                    <tr key={c.id} className="hover:bg-muted/50">
                      <td className="py-3 px-4 border-b font-mono">{c.code}</td>
                      <td className="py-3 px-4 border-b">
                        {formatDateTime(c.createdAt?.toDate())}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            c.used
                              ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                              : "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
                          }`}
                        >
                          {c.used ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        {c.usedBy ? (
                          <div>
                            <div className="font-medium">
                              {c.userName || "No Name"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {c.userEmail || "No Email"}
                            </div>
                            <div className="text-xs text-muted-foreground/80">
                              ID: {c.usedBy}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {formatDateTime(c.usedAt?.toDate()) || "-"}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {c.organizationId ? (
                          <div>
                            <div className="font-medium">
                              {organizations.find(
                                (org) =>
                                  org.organization.id === c.organizationId,
                              )?.organization.name || "Unknown Organization"}
                            </div>
                            <div className="text-xs text-muted-foreground/80 font-mono">
                              ID: {c.organizationId}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminPage;
