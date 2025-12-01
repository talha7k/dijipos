"use client";

import { OwnerManagerGuard } from "@/components/layout/RoleGuard";
import { ReportsHeader } from "@/components/reports/ReportsHeader";
import { ReportsTabs } from "@/components/reports/ReportsTabs";

function ReportsPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <ReportsHeader />
      <ReportsTabs />
    </div>
  );
}

export default function ReportsPageWithGuard() {
  return (
    <OwnerManagerGuard>
      <ReportsPage />
    </OwnerManagerGuard>
  );
}
