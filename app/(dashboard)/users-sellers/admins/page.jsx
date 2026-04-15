"use client";
import UsersSubPage from "@/components/users/UsersSubPage";

export default function AdminsPage() {
  return (
    <UsersSubPage
      role="admin"
      title="Admins"
      description="system administrators"
    />
  );
}