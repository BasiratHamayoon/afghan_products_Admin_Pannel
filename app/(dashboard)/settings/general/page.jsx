"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import GeneralSettings from "@/components/settings/GeneralSettings";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchGeneralSettings, saveGeneralSettings } from "@/store/actions/settingsActions";
import toast from "react-hot-toast";

export default function GeneralSettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { generalSettings, isLoading, isSaving } = useSelector((s) => s.settings);

  useEffect(() => { dispatch(fetchGeneralSettings()); }, [dispatch]);

  const handleSave = async (data) => {
    const res = await dispatch(saveGeneralSettings(data));
    if (res?.success) toast.success("Settings saved successfully!");
    else toast.error("Failed to save settings");
  };

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="General Settings" description="Configure site information, localization, and platform preferences">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <Globe className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">General Settings</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage your platform configuration</p>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading settings..." className="py-16" />
        ) : (
          <GeneralSettings settings={generalSettings} onSave={handleSave} isSaving={isSaving} />
        )}
      </div>
    </div>
  );
}