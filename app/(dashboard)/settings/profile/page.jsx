"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProfileSettings from "@/components/settings/ProfileSettings";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchAdminProfile, saveAdminProfile } from "@/store/actions/settingsActions";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { adminProfile, isLoading, isSaving } = useSelector((s) => s.settings);

  useEffect(() => { dispatch(fetchAdminProfile()); }, [dispatch]);

  const handleSave = async (data) => {
    const res = await dispatch(saveAdminProfile(data));
    if (res?.success) toast.success("Profile saved successfully!");
    else toast.error("Failed to save profile");
  };

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="Profile Settings" description="Manage your admin profile, security, and notification preferences">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
            <User className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Profile Settings</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your personal account settings</p>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading profile..." className="py-16" />
        ) : (
          <ProfileSettings profile={adminProfile} onSave={handleSave} isSaving={isSaving} />
        )}
      </div>
    </div>
  );
}