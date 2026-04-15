"use client";
import VerificationsSubPage from "@/components/verification/VerificationsSubPage";

export default function RejectedVerificationsPage() {
  return (
    <VerificationsSubPage
      status="rejected"
      title="Rejected Verifications"
      description="rejected verification requests"
    />
  );
}