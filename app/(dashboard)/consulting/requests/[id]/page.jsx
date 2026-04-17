"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Trash2, XCircle, MessageSquare,
  DollarSign, Clock, CheckCircle, AlertTriangle, User,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchRequestById, removeRequest, editRequest } from "@/store/actions/consultingActions";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const priorityBg = { high: "rgba(239,68,68,0.1)", medium: "rgba(245,158,11,0.1)", low: "rgba(16,185,129,0.1)" };

const requestStatusMap = {
  pending: "pending",
  assigned: "active",
  completed: "completed",
  cancelled: "inactive",
};

const editableStatuses = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const tabs = ["Details", "Edit Status"];

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedRequest: request, isLoading } = useSelector((state) => state.consulting);

  const [activeTab, setActiveTab] = useState("Details");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("pending");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchRequestById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (request) {
      setEditStatus(request.status || "pending");
      setEditNotes(request.notes || "");
    }
  }, [request]);

  const handleUpdate = async () => {
    if (!id || !request) return;
    setIsSaving(true);
    const res = await dispatch(editRequest(id, {
      ...request,
      status: editStatus,
      notes: editNotes,
    }));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Request updated successfully!");
      setActiveTab("Details");
      dispatch(fetchRequestById(id));
    } else {
      toast.error("Failed to update request");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeRequest(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Request deleted");
      router.push("/consulting/requests");
    } else {
      toast.error("Failed to delete request");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading request..." />
      </div>
    );
  }

  if (!request || !request.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Request not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The request you are looking for does not exist.</p>
        <button
          onClick={() => router.push("/consulting")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Consulting
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={request.title || "Request Detail"}
        description={`By ${request.requestedBy?.name || "Unknown"} · ${request.category || ""}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/consulting")}
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
          <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3">
            <MessageSquare className="h-7 w-7 text-purple-500" />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1 line-clamp-2">{request.title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-2">{request.category}</p>
          <StatusBadge status={requestStatusMap[request.status] || "pending"} />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-2"
            style={{ background: priorityBg[request.priority], color: priorityColors[request.priority] }}
          >
            {request.priority} priority
          </span>
        </motion.div>

        {[
          { label: "Budget", value: `$${request.budget || 0}`, icon: DollarSign, color: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
          { label: "Estimated Hours", value: `${request.estimatedHours || 0}h`, icon: Clock, color: "rgba(124,58,237,0.1)", iconColor: "#7c3aed" },
          { label: "Deadline", value: formatDate(request.deadline), icon: AlertTriangle, color: "rgba(245,158,11,0.1)", iconColor: "#f59e0b" },
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
                className="space-y-6"
              >
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                  <p className="text-sm text-foreground font-medium leading-relaxed">{request.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-xl p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Requested By</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center text-[#0F69B0] font-black text-sm">
                        {request.requestedBy?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{request.requestedBy?.name}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">{request.requestedBy?.email}</p>
                        {request.requestedBy?.company && (
                          <p className="text-[11px] text-[#0F69B0] font-semibold">{request.requestedBy.company}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.assignedConsultant && (
                    <div className="rounded-xl p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/20">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Assigned Consultant</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 font-black text-sm">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{request.assignedConsultant.name}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{request.assignedConsultant.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {request.requirements && request.requirements.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Requirements</p>
                    <ul className="space-y-1.5">
                      {request.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0] mt-2 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.notes && (
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-sm text-foreground font-medium leading-relaxed">{request.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
                  {[
                    { label: "Submitted", value: formatDate(request.createdAt) },
                    { label: "Last Updated", value: formatDate(request.updatedAt) },
                    { label: "Deadline", value: formatDate(request.deadline) },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-xs font-semibold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
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
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Request Status</label>
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
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Internal Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={5}
                    placeholder="Add internal notes about this request..."
                    className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("Details")}
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
        title="Delete Request"
        description={`Are you sure you want to delete "${request.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}