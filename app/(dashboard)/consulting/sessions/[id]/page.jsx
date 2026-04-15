"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Trash2, XCircle, Calendar,
  DollarSign, Clock, Video,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SessionDetails from "@/components/consulting/SessionDetails";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchSessionById, removeSession, editSession } from "@/store/actions/consultingActions";
import { sessionFormatOptions } from "@/data/dummyConsulting";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Details", "Edit Status"];

const editableStatuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const editablePaymentStatuses = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

export default function SessionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedSession: session, isLoading } = useSelector((state) => state.consulting);

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab && tabs.includes(initialTab) ? initialTab : "Details"
  );
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchSessionById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (session) {
      setEditStatus(session.status || "scheduled");
      setEditPaymentStatus(session.paymentStatus || "pending");
      setEditNotes(session.notes || "");
    }
  }, [session]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleUpdate = async () => {
    if (!id || !session) return;
    setIsSaving(true);
    const res = await dispatch(editSession(id, {
      ...session,
      status: editStatus,
      paymentStatus: editPaymentStatus,
      notes: editNotes,
    }));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Session updated successfully!");
      setActiveTab("Details");
      router.replace(`/consulting/sessions/${id}`);
      dispatch(fetchSessionById(id));
    } else {
      toast.error("Failed to update session");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeSession(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Session deleted");
      router.push("/consulting/sessions");
    } else {
      toast.error("Failed to delete session");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading session..." />
      </div>
    );
  }

  if (!session || !session.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Session not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The session you are looking for does not exist.</p>
        <button
          onClick={() => router.push("/consulting/sessions")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </button>
      </div>
    );
  }

  const formatOpt = sessionFormatOptions.find((f) => f.value === session.format) || sessionFormatOptions[0];
  const statusConfig = {
    scheduled: { color: "#0F69B0", bg: "rgba(15,105,176,0.1)" },
    "in-progress": { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    completed: { color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  };
  const sc = statusConfig[session.status] || statusConfig.scheduled;

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={session.title || "Session Detail"}
        description={`${session.consultantName} → ${session.clientName}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/consulting/sessions")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={() => setActiveTab("Edit Status")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            Edit Status
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: sc.bg }}
          >
            <Video className="h-7 w-7" style={{ color: sc.color }} />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1 line-clamp-2">{session.title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-2">{formatOpt.label} · {session.type}</p>
          <StatusBadge status={session.status} />
          <p className="text-[10px] text-muted-foreground font-medium mt-3">{formatDate(session.scheduledAt)}</p>
        </motion.div>

        {[
          { label: "Session Price", value: `$${session.price || 0}`, icon: DollarSign, color: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
          { label: "Duration", value: `${session.duration || 0} ${session.durationUnit || "hours"}`, icon: Clock, color: "rgba(124,58,237,0.1)", iconColor: "#7c3aed" },
          { label: "Scheduled At", value: formatDate(session.scheduledAt), icon: Calendar, color: "rgba(15,105,176,0.1)", iconColor: "#0F69B0" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between"
          >
            <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <SessionDetails session={session} />
              </motion.div>
            )}

            {activeTab === "Edit Status" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 max-w-lg"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Session Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40"
                  >
                    {editableStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40"
                  >
                    {editablePaymentStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Internal Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={5}
                    placeholder="Add internal notes about this session..."
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { setActiveTab("Details"); router.replace(`/consulting/sessions/${id}`); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Session"
        description={`Are you sure you want to delete "${session.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}