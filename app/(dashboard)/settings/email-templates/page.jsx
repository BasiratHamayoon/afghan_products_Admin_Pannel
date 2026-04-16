"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import EmailTemplates from "@/components/settings/EmailTemplates";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchEmailTemplates, saveEmailTemplate, createEmailTemplate, deleteEmailTemplate } from "@/store/actions/settingsActions";

export default function EmailTemplatesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { emailTemplates, isLoading, isSaving } = useSelector((s) => s.settings);

  useEffect(() => { dispatch(fetchEmailTemplates()); }, [dispatch]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="Email Templates" description="Customize automated email notifications sent to users">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
            <Mail className="h-5 w-5 text-[#f59e0b]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Email Templates</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Customize automated email content and layouts</p>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading email templates..." className="py-16" />
        ) : (
          <EmailTemplates
            templates={emailTemplates}
            onSave={(id, data) => dispatch(saveEmailTemplate(id, data))}
            onCreate={(data) => dispatch(createEmailTemplate(data))}
            onDelete={(id) => dispatch(deleteEmailTemplate(id))}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}