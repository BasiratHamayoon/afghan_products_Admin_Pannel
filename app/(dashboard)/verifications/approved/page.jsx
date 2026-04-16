"use client";
import VerificationsSubPage from "@/components/verifications/VerificationsSubPage";

export default function ApprovedVerificationsPage() {
  return (
    <VerificationsSubPage
      status="approved"
      title="Approved Verifications"
      description="approved verification requests"
    />
  );
}