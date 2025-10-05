"use client";

import { useState, useEffect } from "react";

import { useAtomValue } from "jotai";
import { useAuth } from "@/lib/hooks/useAuth";
import { selectedOrganizationAtom, organizationUsersAtom } from "@/atoms";
import { organizationLoadingAtom } from "@/atoms";
import {
  useInvitationsData,
  useInvitationsActions,
} from "@/lib/hooks/useInvitations";
import {
  updateOrganization,
  updateOrganizationBranding,
  updateOrganizationUser,
  updateUserStatus,
} from "@/lib/firebase/firestore/organizations";

import { useAtom } from "jotai";
import { selectedOrganizationIdAtom } from "@/atoms";
import { OrganizationUser } from "@/types";
import { UserRole } from "@/types/enums";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  CreditCard,
} from "lucide-react";






import { toast } from "sonner";

import { CompanyInfoTab } from "@/components/company/CompanyInfoTab";
import { BrandingTab } from "@/components/company/BrandingTab";
import { TeamTab } from "@/components/company/TeamTab";

import { AdminOnlyGuard } from "@/components/layout/RoleGuard";

function CompanyContent() {
  const { user } = useAuth();
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const organizationUsers = useAtomValue(organizationUsersAtom);
  const orgLoading = useAtomValue(organizationLoadingAtom);
  const [selectedOrganizationId, setSelectedOrganizationId] = useAtom(
    selectedOrganizationIdAtom,
  );

  const organizationId = selectedOrganization?.id;
  const organization = selectedOrganization;
  const {
    invitationCodes,
    loading: codesLoading,
    refetch: refetchInvitations,
  } = useInvitationsData(organizationId || undefined);
  const { createInvitationSimple, deleteInvitation } = useInvitationsActions(
    organizationId || undefined,
    refetchInvitations,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OrganizationUser | null>(null);
  const [formData, setFormData] = useState({
    role: UserRole.WAITER,
    isActive: true,
  });
  const [invitationFormData, setInvitationFormData] = useState({
    role: UserRole.WAITER,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  const [activeTab, setActiveTab] = useState("company");

  // Handle URL hash for tab navigation
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (
      hash &&
      ["company", "branding", "team", "subscription"].includes(hash)
    ) {
      setActiveTab(hash);
    }
  }, []);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [companyNameAr, setCompanyNameAr] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [stampUrl, setStampUrl] = useState("");

  useEffect(() => {
    if (!organization) return;

    setCompanyName(organization.name || "");
    setCompanyNameAr(organization.nameAr || "");
    setCompanyEmail(organization.email || "");
    setCompanyAddress(organization.address || "");
    setCompanyPhone(organization.phone || "");
    setVatNumber(organization.vatNumber || "");
    setLogoUrl(organization.logoUrl || "");
    setStampUrl(organization.stampUrl || "");
  }, [organization]);

  useEffect(() => {
    const isLoading = orgLoading || codesLoading;
    setLoading(isLoading);
  }, [orgLoading, codesLoading]);

  const handleRemoveLogo = async () => {
    if (!organizationId) return;

    try {
      await updateOrganizationBranding(organizationId, "", stampUrl);
      setLogoUrl("");
      // Refresh organization data
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Failed to remove logo.");
    }
  };

  const handleRemoveStamp = async () => {
    if (!organizationId) return;

    try {
      await updateOrganizationBranding(organizationId, logoUrl, "");
      setStampUrl("");
      // Refresh organization data
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);
    } catch (error) {
      console.error("Error removing stamp:", error);
      toast.error("Failed to remove stamp.");
    }
  };

  const handleSaveCompanyInfo = async () => {
    if (!organizationId) return;

    setSaving(true);
    try {
      await updateOrganization(organizationId, {
        name: companyName,
        nameAr: companyNameAr,
        email: companyEmail,
        address: companyAddress,
        phone: companyPhone,
        vatNumber: vatNumber,
        logoUrl: logoUrl,
        stampUrl: stampUrl,
      });

      // Refresh organization data to reflect changes
      setSelectedOrganizationId(null);
      setTimeout(() => setSelectedOrganizationId(organizationId), 100);

      toast.success("Company information updated successfully!");
    } catch (error) {
      console.error("Error updating company info:", error);
      toast.error("Failed to update company information.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvitation = async () => {
    if (!organizationId) return;

    console.log(
      "handleCreateInvitation: Creating invitation code with role",
      invitationFormData.role,
    );

    try {
      await createInvitationSimple(
        invitationFormData.role,
        invitationFormData.expiresAt,
      );
      console.log(
        "handleCreateInvitation: Successfully created invitation code",
      );

      setInvitationDialogOpen(false);
      setInvitationFormData({
        role: UserRole.WAITER,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error("Error creating invitation code:", error);
      toast.error("Failed to create invitation code. Please try again.");
    }
  };

  const handleDeleteInvitation = async (codeId: string) => {
    if (!organizationId) return;

    try {
      await deleteInvitation(codeId);
    } catch (error) {
      console.error("Error deleting invitation code:", error);
      toast.error("Failed to delete invitation code. Please try again.");
    }
  };

  const handleCopyInvitation = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Invitation code copied to clipboard!");
    } catch (error) {
      console.error("Error copying code:", error);
      toast.error("Failed to copy code to clipboard.");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !organizationId) return;

    console.log(
      "handleUpdateUser: Updating user",
      editingUser.id,
      "with role",
      formData.role,
      "and status",
      formData.isActive,
    );

    try {
      await updateOrganizationUser(editingUser.id, {
        role:
          formData.role === "admin"
            ? UserRole.ADMIN
            : formData.role === "manager"
              ? UserRole.MANAGER
              : formData.role === "waiter"
                ? UserRole.WAITER
                : UserRole.CASHIER,
        isActive: formData.isActive,
      });

      console.log("handleUpdateUser: Successfully updated user in database");
      setDialogOpen(false);
      setEditingUser(null);
      setFormData({
        role: UserRole.WAITER,
        isActive: true,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    console.log(
      "handleToggleUserStatus: Toggling user",
      userId,
      "to status",
      isActive,
    );

    try {
      await updateUserStatus(userId, isActive);
      console.log(
        "handleToggleUserStatus: Successfully updated user status in database",
      );
      toast.success("User status updated successfully");
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status. Please try again.");
    }
  };

  const openEditDialog = (organizationUser: OrganizationUser) => {
    setEditingUser(organizationUser);
    setFormData({
      role: organizationUser.role,
      isActive: organizationUser.isActive,
    });
    setDialogOpen(true);
  };



  if (!user) return <div>Please log in</div>;
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="h-6 w-6" />
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Company & Account
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <CompanyInfoTab
            companyName={companyName}
            setCompanyName={setCompanyName}
            companyNameAr={companyNameAr}
            setCompanyNameAr={setCompanyNameAr}
            companyEmail={companyEmail}
            setCompanyEmail={setCompanyEmail}
            companyAddress={companyAddress}
            setCompanyAddress={setCompanyAddress}
            companyPhone={companyPhone}
            setCompanyPhone={setCompanyPhone}
            vatNumber={vatNumber}
            setVatNumber={setVatNumber}
            handleSaveCompanyInfo={handleSaveCompanyInfo}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <BrandingTab
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            stampUrl={stampUrl}
            setStampUrl={setStampUrl}
            handleRemoveLogo={handleRemoveLogo}
            handleRemoveStamp={handleRemoveStamp}
            handleSaveCompanyInfo={handleSaveCompanyInfo}
            saving={saving}
            organizationId={organizationId}
          />
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <TeamTab
            invitationCodes={invitationCodes}
            organizationUsers={organizationUsers}
            currentUser={user}
            handleCreateInvitation={handleCreateInvitation}
            handleDeleteInvitation={handleDeleteInvitation}
            handleCopyInvitation={handleCopyInvitation}
            handleUpdateUser={handleUpdateUser}
            handleToggleUserStatus={handleToggleUserStatus}
            openEditDialog={openEditDialog}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            formData={formData}
            setFormData={setFormData}
            invitationFormData={invitationFormData}
            setInvitationFormData={setInvitationFormData}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            invitationDialogOpen={invitationDialogOpen}
            setInvitationDialogOpen={setInvitationDialogOpen}
          />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Current Plan</h3>
                  <p className="text-muted-foreground">Professional Plan</p>
                </div>
                <Badge
                  variant={
                    organization?.subscriptionStatus === "active"
                      ? "default"
                      : "secondary"
                  }
                >
                  {organization?.subscriptionStatus || "Unknown"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Invoices</Label>
                  <p className="text-2xl font-bold">Unlimited</p>
                </div>
                <div>
                  <Label>Storage</Label>
                  <p className="text-2xl font-bold">10GB</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CompanyPage() {
  return (
    <AdminOnlyGuard>
      <CompanyContent />
    </AdminOnlyGuard>
  );
}
