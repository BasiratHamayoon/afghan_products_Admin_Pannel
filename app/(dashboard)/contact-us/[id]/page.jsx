"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Reply, Archive, ArchiveRestore, CheckCheck,
  Loader2, XCircle, MessageCircle, Calendar, Mail,
  Phone, User, Hash, FileText,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchContactMessageById,
  markContactMessageViewedAction,
  archiveContactMessageAction,
  unarchiveContactMessageAction,
  clearContactByIdCache,
} from "@/store/actions/contactUsActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const statusConfig = {
  UNREAD: { label: "Unread", bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  READ: { label: "Read", bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  REPLIED: { label: "Replied", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState({ open: false, action: null });
  const [isActioning, setIsActioning] = useState(false);

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;

    const load = async () => {
      setIsFetching(true);
      setNotFound(false);
      try {
        const res = await dispatch(fetchContactMessageById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          setItemData(res.data);
          // Auto mark as viewed
          if (res.data.status === "UNREAD") {
            await dispatch(markContactMessageViewedAction(id));
            setItemData((prev) => prev ? { ...prev, status: "READ", isViewed: true } : prev);
          }
        } else {
          setNotFound(true);
        }
      } catch {
        if (isMountedRef.current) setNotFound(true);
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [id, dispatch]);

  const handleArchiveConfirm = async () => {
    if (!itemData?.id) {
      setArchiveDialog({ open: false, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn = archiveDialog.action === "archive" ? archiveContactMessageAction : unarchiveContactMessageAction;
      const res = await dispatch(fn(itemData.id));
      if (res?.success) {
        toast.success(archiveDialog.action === "archive" ? "Message archived" : "Message unarchived");
        clearContactByIdCache(itemData.id);
        router.push("/contact-us");
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, action: null });
    }
  };

  const handleMarkViewed = async () => {
    if (!itemData?.id) return;
    setIsActioning(true);
    try {
      const res = await dispatch(markContactMessageViewedAction(itemData.id));
      if (res?.success) {
        toast.success("Marked as read");
        setItemData((prev) => prev ? { ...prev, status: "READ", isViewed: true } : prev);
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsActioning(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading message...</p>
        </div>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────────────────
  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Message not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The message does not exist or has been deleted.</p>
        <button
          onClick={() => router.push("/contact-us")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </div>
    );
  }

  const status = statusConfig[itemData.status] || statusConfig.UNREAD;

  const detailFields = [
    { label: "Name", value: itemData.name, icon: User },
    { label: "Email", value: itemData.email, icon: Mail },
    { label: "Phone", value: itemData.phone || "—", icon: Phone },
    { label: "Subject", value: itemData.subject || "No Subject", icon: FileText },
    { label: "Status", value: status.label, icon: Hash, isStatus: true },
    { label: "Received", value: formatDate(itemData.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Message Detail" description={itemData.name || ""}>
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/contact-us")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/contact-us/reply?id=${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Reply className="h-4 w-4" />Reply
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Sender Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            {getInitials(itemData.name)}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{itemData.name || "Unknown"}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Mail className="h-3.5 w-3.5" />
            {itemData.email || "—"}
          </div>
          {itemData.phone && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mt-1">
              <Phone className="h-3.5 w-3.5" />
              {itemData.phone}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", status.bg, status.text)}>
              {status.label}
            </span>
            {itemData.isArchived && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600">
                Archived
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button
              onClick={() => router.push(`/contact-us/reply?id=${id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20"
            >
              <Reply className="h-3.5 w-3.5" />Reply
            </button>
            {itemData.status === "UNREAD" && (
              <button
                onClick={handleMarkViewed}
                disabled={isActioning}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08] disabled:opacity-60"
              >
                <CheckCheck className="h-3.5 w-3.5" />Mark Read
              </button>
            )}
            {itemData.isArchived ? (
              <button
                onClick={() => setArchiveDialog({ open: true, action: "unarchive" })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />Unarchive
              </button>
            ) : (
              <button
                onClick={() => setArchiveDialog({ open: true, action: "archive" })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800/40"
              >
                <Archive className="h-3.5 w-3.5" />Archive
              </button>
            )}
          </div>
        </motion.div>

        {/* Right — Details + Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Detail Fields */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div key={field.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                      <FieldIcon className="h-4 w-4 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{field.label}</p>
                      {field.isStatus ? (
                        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", status.bg, status.text)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                          {field.value}
                        </span>
                      ) : (
                        <p className="text-sm font-bold text-foreground break-all">{field.value}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Body */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-4">Message</h3>
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                {itemData.message || "No message content."}
              </p>
            </div>
          </div>

          {/* Admin Reply */}
          {itemData.adminReply && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-emerald-100 dark:border-emerald-900/30 shadow-[0_2px_12px_rgba(16,185,129,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <Reply className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-black text-emerald-700 dark:text-emerald-400">Admin Reply</h3>
                {itemData.repliedAt && (
                  <span className="ml-auto text-[11px] text-muted-foreground font-medium">
                    {formatDate(itemData.repliedAt)}
                  </span>
                )}
              </div>
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/50 dark:bg-emerald-900/10">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                  {itemData.adminReply}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? "Archive Message" : "Unarchive Message"}
        description={`Are you sure you want to ${archiveDialog.action} the message from "${itemData?.name}"?`}
        confirmLabel={archiveDialog.action === "archive" ? "Archive" : "Unarchive"}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />
    </div>
  );
}

export default function ContactUsDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailContent />
    </Suspense>
  );
}