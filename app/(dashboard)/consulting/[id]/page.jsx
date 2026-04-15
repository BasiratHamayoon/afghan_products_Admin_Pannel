"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Star, XCircle,
  DollarSign, Users, Calendar, CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConsultantForm from "@/components/consulting/ConsultantForm";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchConsultantById, removeConsultant, editConsultant } from "@/store/actions/consultingActions";
import { availabilityOptions } from "@/data/dummyConsulting";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Overview", "Edit"];

export default function ConsultantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedConsultant: consultant, isLoading } = useSelector((state) => state.consulting);

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab && tabs.includes(initialTab) ? initialTab : "Overview"
  );
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchConsultantById(id));
  }, [dispatch, id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editConsultant(id, data));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Consultant updated successfully!");
      setActiveTab("Overview");
      router.replace(`/consulting/${id}`);
      dispatch(fetchConsultantById(id));
    } else {
      toast.error("Failed to update consultant");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeConsultant(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Consultant deleted");
      router.push("/consulting");
    } else {
      toast.error("Failed to delete consultant");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading consultant..." />
      </div>
    );
  }

  if (!consultant || !consultant.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Consultant not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The consultant you are looking for does not exist.</p>
        <button onClick={() => router.push("/consulting")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" />Back to Consulting
        </button>
      </div>
    );
  }

  const avail = availabilityOptions.find((a) => a.value === consultant.availability) || availabilityOptions[2];

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={consultant.name || "Consultant Detail"} description={consultant.title || "Manage consultant details"}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/consulting")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          <button onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" />Delete
          </button>
          <button onClick={() => setActiveTab("Edit")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />Edit
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              {consultant.name?.charAt(0) || "?"}
            </div>
            {consultant.verified && (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-[#0f1420]">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
            {consultant.featured && (
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          <h3 className="text-base font-black text-foreground mb-0.5">{consultant.name}</h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-1">{consultant.title}</p>
          <p className="text-[11px] text-[#0F69B0] font-semibold mb-2">{consultant.location}</p>
          <StatusBadge status={consultant.status || "inactive"} />
          <div className="mt-3 flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-black text-foreground">{consultant.rating?.toFixed(1)}</span>
            <span className="text-[11px] text-muted-foreground font-medium">({consultant.reviewsCount} reviews)</span>
          </div>
          <span className="mt-2 text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${avail.color}15`, color: avail.color }}>
            {avail.label}
          </span>
        </motion.div>

        {[
          { label: "Sessions Done", value: consultant.sessionsCompleted || 0, icon: Calendar, color: "rgba(15,105,176,0.1)", iconColor: "#0F69B0" },
          { label: "Total Earnings", value: `$${(consultant.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
          { label: "Hourly Rate", value: `$${consultant.hourlyRate || 0}/hr`, icon: DollarSign, color: "rgba(124,58,237,0.1)", iconColor: "#7c3aed" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 1) * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === tab ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
              )}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <div className="space-y-5">
                  {consultant.bio && (
                    <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Biography</h4>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{consultant.bio}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Consultant ID", value: consultant.id },
                      { label: "Email", value: consultant.email },
                      { label: "Phone", value: consultant.phone },
                      { label: "Experience", value: `${consultant.experience} years` },
                      { label: "Education", value: consultant.education },
                      { label: "Timezone", value: consultant.timezone },
                      { label: "Response Time", value: consultant.responseTime },
                      { label: "Currency", value: consultant.currency },
                      { label: "Created At", value: formatDateTime(consultant.createdAt) },
                      { label: "Updated At", value: formatDateTime(consultant.updatedAt) },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-foreground break-all">{item.value || "N/A"}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {(consultant.specializations || []).length > 0 && (
                    <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {consultant.specializations.map((s) => (
                          <span key={s} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(consultant.languages || []).length > 0 && (
                    <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {consultant.languages.map((l) => (
                          <span key={l} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-500">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(consultant.certifications || []).length > 0 && (
                    <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {consultant.certifications.map((c) => (
                          <span key={c} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-green-500/10 text-green-600 dark:text-green-400">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(consultant.categories || []).length > 0 && (
                    <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
                      <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {consultant.categories.map((c) => (
                          <span key={c} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "Edit" && (
              <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <ConsultantForm initialData={consultant} onSubmit={handleUpdate} onCancel={() => setActiveTab("Overview")} isLoading={isSaving} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Consultant"
        description={`Are you sure you want to delete "${consultant.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}