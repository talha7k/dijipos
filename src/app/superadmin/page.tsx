

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
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/hooks/useAuth";

interface OrgCreationCode {
  id: string;
  code: string;
  createdAt: Timestamp;
  used: boolean;
  usedBy: string | null;
  usedAt: Timestamp | null;
  organizationId: string | null;
}

const SuperAdminPage = () => {
  const { user } = useAuth();
  const [codes, setCodes] = useState<OrgCreationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const superAdminDoc = await getDoc(doc(db, "super-admins", user.uid));
          if (superAdminDoc.exists()) {
            setIsSuperAdmin(true);
            const codesCollection = collection(
              db,
              "organization-creation-codes"
            );
            const codesSnapshot = await getDocs(codesCollection);
            const codesList = codesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as OrgCreationCode[];
            setCodes(codesList);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isSuperAdmin) {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Super Admin</h1>
      <div className="mb-4">
        <button
          onClick={generateCode}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Generate New Code
        </button>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Generated Codes</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Code</th>
              <th className="py-2 px-4 border-b">Created At</th>
              <th className="py-2 px-4 border-b">Used</th>
              <th className="py-2 px-4 border-b">Used By</th>
              <th className="py-2 px-4 border-b">Used At</th>
              <th className="py-2 px-4 border-b">Organization ID</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c: OrgCreationCode) => (
              <tr key={c.id}>
                <td className="py-2 px-4 border-b">{c.code}</td>
                <td className="py-2 px-4 border-b">
                  {c.createdAt?.toDate().toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">{c.used ? "Yes" : "No"}</td>
                <td className="py-2 px-4 border-b">{c.usedBy}</td>
                <td className="py-2 px-4 border-b">
                  {c.usedAt?.toDate().toLocaleString()}
                </td>
                <td className="py-2 px-4 border-b">{c.organizationId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminPage;
