

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
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";
import { Organization, User } from "@/types";
import { SubscriptionStatus } from "@/types/enums";

interface OrgCreationCode {
  id: string;
  code: string;
  createdAt: Timestamp;
  used: boolean;
  usedBy: string | null;
  usedAt: Timestamp | null;
  organizationId: string | null;
}

interface OrganizationStats {
  organization: Organization;
  creator: User | null;
  userCount: number;
}

const SuperAdminPage = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<OrgCreationCode[]>([]);
  const [organizations, setOrganizations] = useState<OrganizationStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const superAdminDoc = await getDoc(doc(db, "super-admins", user.uid));
          if (superAdminDoc.exists()) {
            setIsSuperAdmin(true);
            
            // Fetch organization creation codes
            const codesCollection = collection(db, "organization-creation-codes");
            const codesSnapshot = await getDocs(codesCollection);
            const codesList = codesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as OrgCreationCode[];
            setCodes(codesList);
            
            // Fetch all organizations and their stats
            await fetchOrganizationStats();
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else if (user === null) {
        // User is not logged in
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const fetchOrganizationStats = async () => {
    try {
      // Fetch all organizations
      const organizationsCollection = collection(db, "organizations");
      const organizationsSnapshot = await getDocs(organizationsCollection);
      
      const orgStats: OrganizationStats[] = [];
      
      for (const orgDoc of organizationsSnapshot.docs) {
        const orgData = orgDoc.data();
        const organization: Organization = {
          id: orgDoc.id,
          ...orgData,
          createdAt: orgData.createdAt?.toDate() || new Date(),
          updatedAt: orgData.updatedAt?.toDate() || new Date(),
        } as Organization;
        
        // Find the creator from organization creation codes
        let creator: User | null = null;
        const codeQuery = query(
          collection(db, "organization-creation-codes"),
          where("organizationId", "==", organization.id),
          where("used", "==", true)
        );
        const codeSnapshot = await getDocs(codeQuery);
        
        if (!codeSnapshot.empty) {
          const codeData = codeSnapshot.docs[0].data();
          if (codeData.usedBy) {
            const userDoc = await getDoc(doc(db, "users", codeData.usedBy));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              creator = {
                id: userDoc.id,
                ...userData,
                createdAt: userData.createdAt?.toDate() || new Date(),
                updatedAt: userData.updatedAt?.toDate() || new Date(),
              } as User;
            }
          }
        }
        
        // Count users in this organization
        const orgUsersQuery = query(
          collection(db, "organizationUsers"),
          where("organizationId", "==", organization.id),
          where("isActive", "==", true)
        );
        const orgUsersSnapshot = await getDocs(orgUsersQuery);
        const userCount = orgUsersSnapshot.size;
        
        orgStats.push({
          organization,
          creator,
          userCount,
        });
      }
      
      setOrganizations(orgStats);
    } catch (error) {
      console.error("Error fetching organization stats:", error);
    }
  };

  const generateCode = async () => {
    console.log("generateCode called, isSuperAdmin:", isSuperAdmin);
    if (!isSuperAdmin) {
      console.log("User is not super admin, returning");
      return;
    }
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
    }
  };

  const deleteOrganization = async (organizationId: string) => {
    if (!isSuperAdmin) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this organization and all its data? This action cannot be undone.")) {
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
        "templates"
      ];

      let totalDeleted = 0;

      // Process collections in smaller batches to avoid Firestore limits
      for (const collectionName of collectionsToDelete) {
        try {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, where("organizationId", "==", organizationId));
          const snapshot = await getDocs(q);
          
          if (snapshot.size > 0) {
            console.log(`Found ${snapshot.size} documents in ${collectionName}`);
            
            // Process in batches of 500 (Firestore limit)
            const docs = snapshot.docs;
            for (let i = 0; i < docs.length; i += 500) {
              const batch = writeBatch(db);
              const batchDocs = docs.slice(i, i + 500);
              
              batchDocs.forEach((doc) => {
                batch.delete(doc.ref);
              });
              
              await batch.commit();
              totalDeleted += batchDocs.length;
              console.log(`Deleted ${batchDocs.length} documents from ${collectionName}`);
            }
          }
        } catch (collectionError) {
          console.warn(`Error processing collection ${collectionName}:`, collectionError);
          // Continue with other collections even if one fails
        }
      }

      // Handle organization-creation-codes separately (update instead of delete)
      try {
        const codesCollection = collection(db, "organization-creation-codes");
        const codesQuery = query(codesCollection, where("organizationId", "==", organizationId));
        const codesSnapshot = await getDocs(codesQuery);
        
        if (!codesSnapshot.empty) {
          const batch = writeBatch(db);
          codesSnapshot.docs.forEach((doc) => {
            batch.update(doc.ref, {
              organizationId: null,
              used: false,
              usedBy: null,
              usedAt: null
            });
          });
          await batch.commit();
          console.log(`Updated ${codesSnapshot.size} organization creation codes`);
        }
      } catch (codesError) {
        console.warn("Error updating organization creation codes:", codesError);
      }

      // Finally delete the organization document itself
      try {
        const orgDocRef = doc(db, "organizations", organizationId);
        await deleteDoc(orgDocRef);
        console.log("Deleted organization document");
        totalDeleted++;
      } catch (orgError) {
        console.error("Error deleting organization document:", orgError);
        throw orgError; // Re-throw this error as it's critical
      }

      console.log(`Successfully deleted organization ${organizationId} and ${totalDeleted} related documents`);

      // Refresh the data
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
      alert(`Error deleting organization: ${error instanceof Error ? error.message : "Please try again."}`);
    } finally {
      setDeletingOrg(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isSuperAdmin) {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Organizations</h3>
          <p className="text-3xl font-bold">{organizations.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold">
            {organizations.reduce((sum, org) => sum + org.userCount, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Active Codes</h3>
          <p className="text-3xl font-bold">
            {codes.filter(c => !c.used).length}
          </p>
        </div>
      </div>
      
      {/* Organization Management */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Organizations</h2>
          <button
            onClick={generateCode}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate New Code
          </button>
        </div>
        
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left border-b">Organization</th>
                <th className="py-3 px-4 text-left border-b">Created By</th>
                <th className="py-3 px-4 text-left border-b">Creator Email</th>
                <th className="py-3 px-4 text-left border-b">Users</th>
                <th className="py-3 px-4 text-left border-b">Created</th>
                <th className="py-3 px-4 text-left border-b">Status</th>
                <th className="py-3 px-4 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((orgStat) => (
                <tr key={orgStat.organization.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">
                    <div>
                      <div className="font-medium">{orgStat.organization.name}</div>
                      {orgStat.organization.nameAr && (
                        <div className="text-sm text-gray-500">{orgStat.organization.nameAr}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {orgStat.creator ? orgStat.creator.name : "Unknown"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {orgStat.creator ? orgStat.creator.email : "Unknown"}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                      {orgStat.userCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    {orgStat.organization.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      orgStat.organization.subscriptionStatus === SubscriptionStatus.ACTIVE 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {orgStat.organization.subscriptionStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <button
                      onClick={() => deleteOrganization(orgStat.organization.id)}
                      disabled={deletingOrg === orgStat.organization.id}
                      className="bg-red-500 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                      {deletingOrg === orgStat.organization.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Generated Codes Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Generated Codes</h2>
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left border-b">Code</th>
                <th className="py-3 px-4 text-left border-b">Created At</th>
                <th className="py-3 px-4 text-left border-b">Used</th>
                <th className="py-3 px-4 text-left border-b">Used By</th>
                <th className="py-3 px-4 text-left border-b">Used At</th>
                <th className="py-3 px-4 text-left border-b">Organization ID</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c: OrgCreationCode) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b font-mono">{c.code}</td>
                  <td className="py-3 px-4 border-b">
                    {c.createdAt?.toDate().toLocaleString()}
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      c.used 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.used ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{c.usedBy || "-"}</td>
                  <td className="py-3 px-4 border-b">
                    {c.usedAt?.toDate().toLocaleString() || "-"}
                  </td>
                  <td className="py-3 px-4 border-b font-mono text-sm">
                    {c.organizationId || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
