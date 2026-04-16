"use client";
import VerificationsSubPage from "@/components/verifications/VerificationsSubPage";

export default function PendingVerificationsPage() {
  return (
    <VerificationsSubPage
      status="pending"
      title="Pending Verifications"
      description="verification requests awaiting review"
    />
  );
}