"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Trash2, XCircle, Loader2,
  Package, MapPin, AlertTriangle,
  DollarSign, Hash, FileText, User, Mail,
  Calendar, CheckCircle, Tag,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchTradeLeadById,
  removeTradeLead,
  updateTradeLeadStatus,
} from "@/store/actions/tradeLeadsActions";
import { getFileUrl } from "@/lib/fileUrl";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const urgencyConfig = {
  HIGH: { label: "High Urgency", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  MEDIUM: { label: "Medium Urgency", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  LOW: { label: "Low Urgency", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

const statusConfig = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  EXPIRED: { label: "Expired", bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TradeLeadDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();

  const { selectedLead, isDetailLoading } = useSelector((state) => state.tradeLeads);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, status: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchTradeLeadById(id)).then((res) => {
      if (!res?.success) setNotFound(true);
    });
  }, [id, dispatch]);

  const lead = selectedLead?.id === id ? selectedLead : null;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeTradeLead(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Trade lead deleted");
      router.push("/trade-leads");
    } else {
      toast.error(res?.message || "Failed to delete");
    }
    setDeleteDialog(false);
  };

  const handleStatusConfirm = async () => {
    if (!lead?.id || !statusDialog.status) {
      setStatusDialog({ open: false, status: null });
      return;
    }
    setIsUpdating(true);
    const res = await dispatch(updateTradeLeadStatus(lead.id, statusDialog.status));
    setIsUpdating(false);
    if (res?.success) {
      toast.success(`Status updated to ${statusDialog.status}`);
    } else {
      toast.error(res?.message || "Failed to update status");
    }
    setStatusDialog({ open: false, status: null });
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading trade lead...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!isDetailLoading && !lead?.id)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Trade lead not found</h2>
        <button
          onClick={() => router.push("/trade-leads")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trade Leads
        </button>
      </div>
    );
  }

  if (!lead) return null;

  const urgency = urgencyConfig[lead.urgency] || urgencyConfig.LOW;
  const status = statusConfig[lead.status] || statusConfig.PENDING;
  const attachmentUrl = lead.attachment ? getFileUrl(lead.attachment) : null;
  const isPending = lead.status === "PENDING";
  const isRejected = lead.status === "REJECTED";

  const detailFields = [
    { label: "Product", value: lead.productName, icon: Package },
    { label: "Category", value: lead.categoryName, icon: Tag },
    { label: "Quantity", value: `${lead.quantity} ${lead.unit}`, icon: Hash },
    { label: "Min Budget", value: `AFN ${Number(lead.minBudget).toLocaleString()}`, icon: DollarSign },
    { label: "Max Budget", value: `AFN ${Number(lead.maxBudget).toLocaleString()}`, icon: DollarSign },
    { label: "Location", value: lead.location, icon: MapPin },
    { label: "Urgency", value: urgency.label, icon: AlertTriangle },
    { label: "Status", value: status.label, icon: CheckCircle },
    { label: "Created", value: formatDate(lead.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(lead.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Trade Lead Detail" description={lead.productName || "Trade Lead"}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/trade-leads")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {isPending && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusDialog({ open: true, status: "APPROVED" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </motion.button>
          )}

          {isPending && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusDialog({ open: true, status: "REJECTED" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </motion.button>
          )}

          {isRejected && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatusDialog({ open: true, status: "APPROVED" })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden flex flex-col items-center text-center"
        >
          <div
            className="h-24 w-full relative"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <div className="absolute inset-0">
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div
                className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>
          </div>

          <div className="-mt-8 mb-3 relative z-10">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center shadow-xl ring-[3px] ring-white dark:ring-[#0f1420]"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>

          <div className="px-5 pb-5 w-full">
            <h3 className="text-base font-black text-foreground mb-1">
              {lead.productName || "Trade Lead"}
            </h3>

            {lead.categoryName && (
              <p className="text-[11px] text-muted-foreground font-medium mb-3">
                {lead.categoryName}
              </p>
            )}

            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full",
                  status.bg,
                  status.text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                {status.label}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full",
                  urgency.bg,
                  urgency.text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", urgency.dot)} />
                {urgency.label}
              </span>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-sm font-black text-foreground">
              <DollarSign className="h-4 w-4 text-[#0F69B0]" />
              AFN {Number(lead.minBudget).toLocaleString()} – {Number(lead.maxBudget).toLocaleString()}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-muted-foreground font-medium">
              <MapPin className="h-3.5 w-3.5" />
              {lead.location || "No location"}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
              <Package className="h-3.5 w-3.5" />
              {lead.quantity} {lead.unit}
            </div>

            {(lead.requestedUnlockCount > 0 || lead.unlockedCount > 0) && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                <div className="flex items-center justify-center gap-4 text-[11px] font-bold">
                  <span className="text-muted-foreground">
                    Unlock Requests:{" "}
                    <span className="text-foreground">{lead.requestedUnlockCount}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Unlocked:{" "}
                    <span className="text-foreground">{lead.unlockedCount}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <Package className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Trade Lead Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(15,105,176,0.08)" }}
                    >
                      <FieldIcon className="h-3.5 w-3.5 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-xs font-bold text-foreground break-all">
                        {field.value || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {lead.detailDescription && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Description</h3>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {lead.detailDescription}
              </p>
            </div>
          )}

          {attachmentUrl && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Attachment</h3>
              </div>
              <a
                href={attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl border border-[#0F69B0]/20 bg-[#0F69B0]/[0.03] hover:bg-[#0F69B0]/[0.06] transition-colors cursor-pointer"
              >
                <FileText className="h-5 w-5 text-[#0F69B0]" />
                <span className="text-sm font-bold text-[#0F69B0]">View Attachment</span>
              </a>
            </div>
          )}

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Posted By</h3>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-black text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                {getInitials(lead.createdByName)}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{lead.createdByName || "—"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground font-medium">
                    {lead.createdByEmail || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Trade Lead"
        description="Are you sure you want to delete this trade lead? This cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, status: null })}
        onConfirm={handleStatusConfirm}
        title={statusDialog.status === "APPROVED" ? "Approve Trade Lead" : "Reject Trade Lead"}
        description={
          statusDialog.status === "APPROVED"
            ? "Are you sure you want to approve this trade lead? It will become visible to sellers."
            : "Are you sure you want to reject this trade lead?"
        }
        confirmLabel={statusDialog.status === "APPROVED" ? "Approve" : "Reject"}
        isLoading={isUpdating}
        variant={statusDialog.status === "APPROVED" ? "primary" : "danger"}
      />
    </div>
  );
}