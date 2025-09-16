"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/legacy_hooks/useAuthState";
import {
  Building2,
  Plus,
  Users,
  ArrowRight,
  Crown,
  Mail,
  LogOut,
  Sun,
  Moon,
  Phone,
  MapPin,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Organization, UserRole } from "@/types";
import { useThemeState } from "@/legacy_hooks/useThemeState";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export function OrganizationManager() {
  const {
    user,
    organizationId,
    userOrganizations,
    selectOrganization,
    refreshUserOrganizations,
  } = useAuthState();
  const { theme, toggleTheme } = useThemeState();
  const router = useRouter();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newOrganizationName, setNewOrganizationName] = useState("");
  const [newOrganizationEmail, setNewOrganizationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [organizations, setOrganizations] = useState<{
    [key: string]: Organization;
  }>({});

  const isDark = theme === "dark";

  // Fetch organization details for all user organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      const orgData: { [key: string]: Organization } = {};

      for (const userOrg of userOrganizations) {
        try {
          const orgDoc = await getDoc(
            doc(db, "organizations", userOrg.organizationId)
          );
          if (orgDoc.exists()) {
            orgData[userOrg.organizationId] = {
              id: orgDoc.id,
              ...orgDoc.data(),
              createdAt: orgDoc.data().createdAt?.toDate(),
              updatedAt: orgDoc.data().updatedAt?.toDate(),
            } as Organization;
          }
        } catch (error) {
          console.error("Error fetching organization:", error);
        }
      }

      setOrganizations(orgData);
    };

    if (userOrganizations.length > 0) {
      fetchOrganizations();
    }
  }, [userOrganizations]);

  const handleJoinOrganization = async () => {
    if (!joinCode || !user) return;

    setLoading(true);
    setJoinError("");
    try {
      // Find the invitation code
      const codesQuery = query(
        collection(db, "invitationCodes"),
        where("code", "==", joinCode.toUpperCase()),
        where("isUsed", "==", false)
      );
      const codesSnapshot = await getDocs(codesQuery);

      if (codesSnapshot.empty) {
        setJoinError("Invalid or expired invitation code");
        return;
      }

      const invitationCode = codesSnapshot.docs[0].data();
      const codeId = codesSnapshot.docs[0].id;

      // Check if code is expired
      if (invitationCode.expiresAt.toDate() < new Date()) {
        setJoinError("Invitation code has expired");
        return;
      }

      // Check if user is already a member
      const existingMembershipQuery = query(
        collection(db, "organizationUsers"),
        where("userId", "==", user.uid),
        where("organizationId", "==", invitationCode.organizationId)
      );
      const existingMembershipSnapshot = await getDocs(existingMembershipQuery);

      if (!existingMembershipSnapshot.empty) {
        setJoinError("You are already a member of this organization");
        return;
      }

      // Add user to organization
      await addDoc(collection(db, "organizationUsers"), {
        userId: user.uid,
        organizationId: invitationCode.organizationId,
        role: invitationCode.role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Mark invitation code as used
      await addDoc(collection(db, "usedInvitationCodes"), {
        codeId,
        userId: user.uid,
        usedAt: serverTimestamp(),
      });

      // Refresh user organizations to include the new one
      await refreshUserOrganizations();

      // Switch to the new organization
      await selectOrganization(invitationCode.organizationId);

      setShowJoinForm(false);
      setJoinCode("");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error joining organization:", error);
      setJoinError(
        "Failed to join organization. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrganizationName || !newOrganizationEmail || !user) return;

    setLoading(true);
    try {
      // Create new organization
      const organizationRef = await addDoc(collection(db, "organizations"), {
        name: newOrganizationName,
        email: newOrganizationEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        subscriptionStatus: "trial",
      });

      // Add creator as admin
      await addDoc(collection(db, "organizationUsers"), {
        userId: user.uid,
        organizationId: organizationRef.id,
        role: "admin",
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Refresh user organizations to include the new one
      await refreshUserOrganizations();

      // Switch to the new organization
      await selectOrganization(organizationRef.id);

      setShowCreateForm(false);
      setNewOrganizationName("");
      setNewOrganizationEmail("");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating organization:", error);
      toast("Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchOrganization = async (organizationUserId: string) => {
    await selectOrganization(organizationUserId);
    router.push("/dashboard");
  };

  if (!user) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      } overflow-y-auto`}
    >
      <div className="w-full max-w-7xl mx-auto p-4 pt-20">
        {/* Top Header */}
        <div
          className={`absolute top-0 left-0 right-0 z-50 flex justify-end p-2 pr-4 border ${
            isDark
              ? "bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-slate-700/30"
              : "bg-gradient-to-r from-white/60 to-blue-50/60 border-blue-200/30"
          } backdrop-blur-sm`}
        >
          <div className="flex gap-3">
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={() => auth.signOut()}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                isDark
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Header */}
        <div
          className={`flex items-stretch mb-12 p-8 rounded-2xl border ${
            isDark
              ? "bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50"
              : "bg-gradient-to-r from-white/80 to-blue-50/80 border-blue-200/50"
          } backdrop-blur-sm`}
        >
          <div className="flex-1 flex items-center justify-center">
            <div
              className={`p-2 rounded-2xl ${
                isDark
                  ? "bg-gradient-to-r from-purple-600/10 to-blue-600/10"
                  : "bg-gradient-to-r from-blue-600/10 to-indigo-600/10"
              }`}
            >
              <Image
                src="/icon_logo.svg"
                alt="DijiBill Logo"
                width={64}
                height={64}
                className="h-20 w-20"
              />
            </div>
            <h1
              className={`text-5xl font-bold ml-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              DijiBill
            </h1>
          </div>
          <div className="flex-2 flex items-center">
            <p
              className={`text-xl ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Welcome to{" "}
              <span
                className={`font-semibold ${
                  isDark ? "text-purple-400" : "text-blue-600"
                }`}
              >
                DijiBill
              </span>
              !
              <br />
              Your complete business management solution. Create or join
              organizations to streamline your invoicing, inventory, and
              customer management.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {organizationId && (
              <Button
                onClick={() => router.push("/dashboard")}
                className={`flex items-center gap-2 ${
                  isDark
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <ArrowRight className="h-4 w-4" />
                Continue to Dashboard
              </Button>
            )}
          </div>
        </div>

        {/* Content Section Separator */}
        <div
          className={`w-full h-px mb-8 ${
            isDark
              ? "bg-gradient-to-r from-transparent via-slate-600 to-transparent"
              : "bg-gradient-to-r from-transparent via-blue-200 to-transparent"
          }`}
        ></div>

        <div className="grid lg:grid-cols-2 gap-12 relative">
          {/* Vertical divider line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600 transform -translate-x-px"></div>
          <div className="space-y-6">
            {/* Existing Organizations */}
            {userOrganizations.length > 0 && (
              <div>
                <div className="mb-8">
                  <h2
                    className={`text-3xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Your Organizations
                  </h2>
                </div>
                <div className="space-y-4">
                  {userOrganizations.map((organizationUser) => {
                    const org = organizations[organizationUser.organizationId];
                    const isSelected =
                      organizationId === organizationUser.organizationId;
                    return (
                      <Card
                        key={organizationUser.organizationId}
                        className={`group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-offset-2 ${
                          isSelected
                            ? isDark
                              ? "border-purple-500 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:ring-purple-400/50"
                              : "border-blue-500 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:ring-blue-400/50"
                            : isDark
                            ? "border-slate-600 bg-gradient-to-r from-slate-700/50 to-slate-800/50 hover:border-purple-400 hover:ring-purple-400/50"
                            : "border-slate-300 bg-gradient-to-r from-slate-50 to-blue-50/30 hover:border-blue-300 hover:ring-blue-400/50"
                        }`}
                        onClick={() =>
                          handleSwitchOrganization(
                            organizationUser.organizationId
                          )
                        }
                      >
                        <CardContent className="px-12 py-4 flex flex-col justify-center items-center min-h-[140px]">
                          <div className="space-y-4">
                            {/* Icon + Name Row - Centered */}
                            <div className="flex items-center justify-center gap-3">
                              {/* Organization Icon */}
                              <div
                                className={`p-3 rounded-xl flex-shrink-0 ${
                                  isSelected
                                    ? isDark
                                      ? "bg-gradient-to-r from-purple-500 to-blue-500"
                                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                    : isDark
                                    ? "bg-gradient-to-r from-slate-500 to-slate-600"
                                    : "bg-gradient-to-r from-slate-300 to-slate-400"
                                }`}
                              >
                                <Building2 className={`h-6 w-6 text-white`} />
                              </div>

                              {/* Organization Name */}
                              <h3
                                className={`font-bold text-lg ${
                                  isDark ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {org?.name ||
                                  `Organization ${organizationUser.organizationId.slice(
                                    -6
                                  )}`}
                              </h3>
                            </div>
                            <div className="flex-col justify-center items-center ">
                              {/* Email + Role Row */}
                              <div className="flex items-center">
                                <div
                                  className={`text-sm flex items-center gap-2 ${
                                    isDark ? "text-slate-300" : "text-slate-600"
                                  }`}
                                >
                                  <Mail className="h-4 w-4" />
                                  {org?.email || "No email"}
                                  <Badge
                                    variant={
                                      isSelected ? "default" : "secondary"
                                    }
                                    className={`capitalize text-xs ml-2 flex items-center gap-1 ${
                                      organizationUser.role === UserRole.ADMIN
                                        ? isDark
                                          ? "bg-slate-800 text-yellow-400 border-yellow-500 border-2"
                                          : "bg-white text-yellow-600 border-yellow-500 border-2"
                                        : `bg-transparent border-0 ${
                                            isSelected
                                              ? isDark
                                                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                                                : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                              : isDark
                                              ? "bg-slate-600 text-slate-200"
                                              : "bg-slate-300 text-slate-700"
                                          }`
                                    }`}
                                  >
                                    {organizationUser.role ===
                                      UserRole.ADMIN && (
                                      <Crown className="h-3 w-3" />
                                    )}
                                    {organizationUser.role}
                                  </Badge>
                                </div>
                              </div>

                              {/* Additional Contact Info */}
                              <div className="space-y-2">
                                {org?.phone && (
                                  <p
                                    className={`text-sm flex items-center gap-2 ${
                                      isDark
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    <Phone className="h-4 w-4" />
                                    {org.phone}
                                  </p>
                                )}
                                {org?.address && (
                                  <p
                                    className={`text-sm flex items-center gap-2 ${
                                      isDark
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                    }`}
                                  >
                                    <MapPin className="h-4 w-4" />
                                    {org.address}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Join/Create Options */}
            {/* Join Organization */}
            <Card
              className={`transition-all duration-300 hover:shadow-2xl cursor-pointer hover:scale-105 ${
                isDark
                  ? "border-gray-700 bg-gray-800/50 hover:border-blue-400 hover:bg-blue-500/10"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
              }`}
              onClick={() => setShowJoinForm(true)}
            >
              <CardContent className="px-6 py-4">
                <div className="text-center space-y-4">
                  <div
                    className={`p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${
                      isDark ? "bg-blue-600/20" : "bg-blue-100"
                    }`}
                  >
                    <Users
                      className={`h-8 w-8 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3
                      className={`text-xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Join Organization
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Connect with an existing organization using an invitation
                      code
                    </p>
                  </div>

                  {!showJoinForm ? (
                    <div
                      className={`text-sm font-medium pb-1 ${
                        isDark ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      Click to join with invitation code
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="joinCode"
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Invitation Code
                        </Label>
                        <Input
                          id="joinCode"
                          placeholder="Enter invitation code"
                          value={joinCode}
                          onChange={(e) =>
                            setJoinCode(e.target.value.toUpperCase())
                          }
                          className={`font-mono uppercase text-center py-2 ${
                            isDark
                              ? "bg-gray-800 border-gray-700 text-white"
                              : ""
                          }`}
                        />
                        {joinError && (
                          <p className="text-sm text-red-500 mt-2">
                            {joinError}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowJoinForm(false);
                            setJoinCode("");
                            setJoinError("");
                          }}
                          className={`flex-1 py-2 text-sm ${
                            isDark
                              ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                              : ""
                          }`}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleJoinOrganization}
                          disabled={!joinCode || loading}
                          className={`flex-1 py-2 text-sm font-medium text-white ${
                            isDark
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {loading ? "Joining..." : "Join Now"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Create Organization */}
            <Card
              className={`transition-all duration-300 hover:shadow-2xl cursor-pointer hover:scale-105 ${
                isDark
                  ? "border-gray-700 bg-gray-800/50 hover:border-green-400 hover:bg-green-500/10"
                  : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50"
              }`}
              onClick={() => setShowCreateForm(true)}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div
                    className={`p-3 rounded-full w-16 h-16 mx-auto flex items-center justify-center ${
                      isDark ? "bg-green-600/20" : "bg-green-100"
                    }`}
                  >
                    <Plus
                      className={`h-8 w-8 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <h3
                      className={`text-xl font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Create Organization
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Start fresh by creating your own organization
                    </p>
                  </div>

                  {!showCreateForm ? (
                    <div
                      className={`text-sm font-medium pb-1 ${
                        isDark ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Click to create a new organization
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="organizationName"
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Organization Name
                        </Label>
                        <Input
                          id="organizationName"
                          placeholder="Enter organization name"
                          value={newOrganizationName}
                          onChange={(e) =>
                            setNewOrganizationName(e.target.value)
                          }
                          className={`py-2 ${
                            isDark
                              ? "bg-gray-800 border-gray-700 text-white"
                              : ""
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="organizationEmail"
                          className={`${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Organization Email
                        </Label>
                        <Input
                          id="organizationEmail"
                          type="email"
                          placeholder="organization@example.com"
                          value={newOrganizationEmail}
                          onChange={(e) =>
                            setNewOrganizationEmail(e.target.value)
                          }
                          className={`py-2 ${
                            isDark
                              ? "bg-gray-800 border-gray-700 text-white"
                              : ""
                          }`}
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateForm(false);
                            setNewOrganizationName("");
                            setNewOrganizationEmail("");
                          }}
                          className={`flex-1 py-2 text-sm ${
                            isDark
                              ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                              : ""
                          }`}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateOrganization}
                          disabled={
                            !newOrganizationName ||
                            !newOrganizationEmail ||
                            loading
                          }
                          className={`flex-1 py-2 text-sm font-medium text-white ${
                            isDark
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {loading ? "Creating..." : "Create Now"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
