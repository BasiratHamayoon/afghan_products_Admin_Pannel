"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Trash2, Loader2, XCircle,
  Calendar, MapPin, DollarSign, TrendingUp,
  Briefcase, Tag, Hash, FileText, CheckCircle,
  Clock, AlertTriangle, Building2, User, ImageIcon,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchInvestmentById,
  toggleInvestmentApproval,
  deleteInvestment,
  clearInvestmentByIdCache,
} from "@/store/actions/investmentsActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const APPROVAL_CONFIG = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-500",
    dot: "bg-red-500",
  },
};

const RISK_CONFIG = {
  low: { label: "Low Risk", cls: "bg-emerald-500/10 text-emerald-600" },
  medium: {
    label: "Medium Risk",
    cls: "bg-amber-500/10 text-amber-600",
  },
  high: { label: "High Risk", cls: "bg-red-500/10 text-red-500" },
};

function formatAmount(amount) {
  if (!amount && amount !== 0) return "—";
  return `$${Number(amount).toLocaleString()}`;
}

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    action: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchInvestmentById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) setItemData(res.data);
        else setNotFound(true);
      } catch {
        if (isMountedRef.current) setNotFound(true);
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [id, dispatch]);

  const handleApprovalConfirm = async () => {
    if (!itemData?.id || !approvalDialog.action) {
      setApprovalDialog({ open: false, action: null });
      return;
    }
    setIsApproving(true);
    try {
      const res = await dispatch(
        toggleInvestmentApproval(
          itemData.id,
          approvalDialog.action
        )
      );
      if (res?.success) {
        toast.success(
          approvalDialog.action === "APPROVED"
            ? "Approved"
            : "Rejected"
        );
        setItemData((prev) =>
          prev
            ? {
                ...prev,
                approvalStatus: approvalDialog.action,
              }
            : prev
        );
        clearInvestmentByIdCache(itemData.id);
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsApproving(false);
      setApprovalDialog({ open: false, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) {
      setDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteInvestment(itemData.id));
      if (res?.success) {
        toast.success("Deleted");
        clearInvestmentByIdCache(itemData.id);
        router.push("/investments");
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
      </div>
    );
  }

  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          Investment not found
        </h2>
        <button
          onClick={() => router.push("/investments")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

  const approval =
    APPROVAL_CONFIG[itemData.approvalStatus] ||
    APPROVAL_CONFIG.PENDING;
  const risk =
    RISK_CONFIG[itemData.riskLevel] || RISK_CONFIG.medium;
  const imgUrl = itemData.images?.[0]
    ? getFileUrl(itemData.images[0])
    : null;
  const progressPercent =
    itemData.requiredAmount > 0
      ? Math.min(
          100,
          Math.round(
            (itemData.raisedAmount / itemData.requiredAmount) *
              100
          )
        )
      : 0;

  const detailFields = [
    { label: "Title", value: itemData.title, icon: FileText },
    {
      label: "Category",
      value: itemData.category || "—",
      icon: Tag,
    },
    {
      label: "Risk Level",
      value: risk.label,
      icon: AlertTriangle,
      isBadge: true,
      badgeCls: risk.cls,
    },
    {
      label: "Required Amount",
      value: formatAmount(itemData.requiredAmount),
      icon: DollarSign,
    },
    {
      label: "Raised Amount",
      value: formatAmount(itemData.raisedAmount),
      icon: DollarSign,
    },
    {
      label: "Min Investment",
      value: formatAmount(itemData.minInvestment),
      icon: DollarSign,
    },
    {
      label: "Expected ROI",
      value: `${itemData.expectedROI}%`,
      icon: TrendingUp,
    },
    {
      label: "Duration",
      value: `${itemData.durationMonths} months`,
      icon: Clock,
    },
    {
      label: "City",
      value: itemData.city || "—",
      icon: MapPin,
    },
    {
      label: "Country",
      value: itemData.country || "—",
      icon: MapPin,
    },
    {
      label: "Business",
      value: itemData.businessName || "—",
      icon: Building2,
    },
    {
      label: "Owner",
      value: itemData.ownerName || "—",
      icon: User,
    },
    {
      label: "Status",
      value: itemData.status || "—",
      icon: Hash,
    },
    {
      label: "Created",
      value: formatDate(itemData.createdAt),
      icon: Calendar,
    },
    {
      label: "Updated",
      value: formatDate(itemData.updatedAt),
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Investment Detail"
        description={itemData.title || ""}
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/investments")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={itemData.title}
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span className="text-5xl">💰</span>
            )}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">
            {itemData.title}
          </h3>
          {itemData.businessName && (
            <p className="text-xs text-muted-foreground font-medium">
              {itemData.businessName}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5" />
            {[itemData.city, itemData.country]
              .filter(Boolean)
              .join(", ")}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full",
                approval.bg,
                approval.text
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  approval.dot
                )}
              />
              {approval.label}
            </span>
            <span
              className={cn(
                "text-[11px] font-bold px-3 py-1 rounded-full",
                risk.cls
              )}
            >
              {risk.label}
            </span>
          </div>

          <div className="w-full mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                {formatAmount(itemData.raisedAmount)}
              </span>
              <span className="text-muted-foreground font-medium">
                of {formatAmount(itemData.requiredAmount)}
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F69B0] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium text-right">
              {progressPercent}% funded
            </p>
          </div>

          {itemData.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
              {itemData.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            {itemData.approvalStatus !== "APPROVED" && (
              <button
                onClick={() =>
                  setApprovalDialog({
                    open: true,
                    action: "APPROVED",
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border border-emerald-200 dark:border-emerald-800/40"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </button>
            )}
            {itemData.approvalStatus !== "REJECTED" && (
              <button
                onClick={() =>
                  setApprovalDialog({
                    open: true,
                    action: "REJECTED",
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer border border-amber-200 dark:border-amber-800/40"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
            )}
            <button
              onClick={() => setDeleteDialog(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">
              Investment Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.label}
                    className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(15,105,176,0.08)",
                      }}
                    >
                      <Icon className="h-4 w-4 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        {f.label}
                      </p>
                      {f.isBadge ? (
                        <span
                          className={cn(
                            "inline-flex text-[11px] font-bold px-2.5 py-1 rounded-lg",
                            f.badgeCls
                          )}
                        >
                          {f.value}
                        </span>
                      ) : (
                        <p className="text-sm font-bold text-foreground break-all">
                          {f.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {itemData.description && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">
                Description
              </h3>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                  {itemData.description}
                </p>
              </div>
            </div>
          )}

          {itemData.images?.length > 1 && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-4 w-4 text-[#0F69B0]" />
                <h3 className="text-sm font-black text-foreground">
                  Images ({itemData.images.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {itemData.images.map((img, i) => (
                  <div
                    key={i}
                    className="h-28 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04]"
                  >
                    <img
                      src={getFileUrl(img)}
                      alt={`Image ${i + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={approvalDialog.open}
        onClose={() =>
          setApprovalDialog({ open: false, action: null })
        }
        onConfirm={handleApprovalConfirm}
        title={
          approvalDialog.action === "APPROVED"
            ? "Approve Investment"
            : "Reject Investment"
        }
        description={`Are you sure you want to ${
          approvalDialog.action === "APPROVED"
            ? "approve"
            : "reject"
        } "${itemData?.title}"?`}
        confirmLabel={
          approvalDialog.action === "APPROVED"
            ? "Approve"
            : "Reject"
        }
        isLoading={isApproving}
        variant={
          approvalDialog.action === "APPROVED"
            ? "primary"
            : "danger"
        }
      />

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Investment"
        description={`Delete "${itemData?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function InvestmentDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailContent />
    </Suspense>
  );
}