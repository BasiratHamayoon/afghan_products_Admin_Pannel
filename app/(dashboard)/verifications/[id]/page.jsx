"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Building, CheckCircle, XCircle,
  Loader2, Calendar, Hash, FileText,
  User, Star, Mail, Trash2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchBusinessById,
  updateVerificationStatus,
  deleteBusinessAction,
} from "@/store/actions/businessesActions";
import { getFileUrl } from "@/lib/fileUrl";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const vStatusConfig = {
  VERIFIED: { label: "Verified", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  PENDING: { label: "Pending Review", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  UNVERIFIED: { label: "Unverified", bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function DocCard({ label, filename }) {
  const url = filename ? getFileUrl(filename) : null;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden">
      <div className="h-36 w-full bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center overflow-hidden">
        {url ? (
          <img src={url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-[10px] font-bold text-muted-foreground/50">Not uploaded</p>
          </div>
        )}
      </div>
      <div className="p-3 flex items-center justify-between">
        <p className="text-[11px] font-bold text-foreground">{label}</p>
        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", url ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-400")}>
          {url ? "Uploaded" : "Missing"}
        </span>
      </div>
    </div>
  );
}

export default function VerificationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();

  const { selectedBusiness, isDetailLoading } = useSelector((state) => state.businesses);

  const [error, setError] = useState(null);
  const [verifyDialog, setVerifyDialog] = useState({ open: false, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false });
  const [isProcessing, setIsProcessing] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;

    dispatch(fetchBusinessById(id)).then((res) => {
      if (!res?.success) {
        setError(res?.message || "Failed to load business");
      }
    });
  }, [id, dispatch]);

  const biz = selectedBusiness?.id === id || selectedBusiness?._id === id ? selectedBusiness : null;

  const handleVerify = async (action) => {
    if (!biz?.id) return;
    setIsProcessing(true);
    try {
      const res = await dispatch(updateVerificationStatus(biz.id, action));
      if (res?.success) {
        toast.success(action === "approve" ? "Business verified" : "Business rejected");
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
      setVerifyDialog({ open: false, action: null });
    }
  };

  const handleDelete = async () => {
    if (!biz?.id) return;
    setIsProcessing(true);
    try {
      const res = await dispatch(deleteBusinessAction(biz.id));
      if (res?.success) {
        toast.success("Business deleted successfully");
        router.push("/verifications");
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ open: false });
    }
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading business...</p>
        </div>
      </div>
    );
  }

  if (error || !biz) {
    return (
      <div className="space-y-5">
        <Breadcrumb />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-black text-foreground">Business not found</h2>
          {error && <p className="text-xs text-red-500 font-medium max-w-md text-center">{error}</p>}
          <button
            onClick={() => router.push("/verifications")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <ArrowLeft className="h-4 w-4" />Back to Verifications
          </button>
        </div>
      </div>
    );
  }

  const vs = biz.verificationStatus;
  const vsc = vStatusConfig[vs] || vStatusConfig.UNVERIFIED;
  const isPending = vs === "PENDING" || vs === "UNVERIFIED";
  const logoUrl = biz.logo ? getFileUrl(biz.logo) : null;

  const infoFields = [
    { label: "Business Name", value: biz.businessName, icon: Building },
    { label: "TIN", value: biz.tin, icon: Hash },
    { label: "Ownership Type", value: biz.ownershipType, icon: FileText },
    { label: "Year Established", value: biz.yearOfEstablishment ? String(biz.yearOfEstablishment) : "—", icon: Calendar },
    { label: "Owner Name", value: biz.ownerName, icon: User },
    { label: "Owner Email", value: biz.ownerEmail, icon: Mail },
    { label: "Average Rating", value: String(biz.averageRating), icon: Star },
    { label: "Created", value: formatDate(biz.createdAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Verification Detail" description={biz.businessName}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/verifications")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />Back
          </motion.button>
          {isPending && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVerifyDialog({ open: true, action: "approve" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />Approve
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setVerifyDialog({ open: true, action: "reject" })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                <XCircle className="h-4 w-4" />Reject
              </motion.button>
            </>
          )}
          {vs === "VERIFIED" && (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-4 w-4" />Verified
            </span>
          )}
          {vs === "REJECTED" && (
            <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-500">
              <XCircle className="h-4 w-4" />Rejected
            </span>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDeleteDialog({ open: true })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />Delete
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden flex flex-col items-center text-center"
        >
          <div className="h-24 w-full relative" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <div className="absolute inset-0">
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          </div>
          <div className="-mt-8 mb-3 relative z-10">
            <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-xl ring-[3px] ring-white dark:ring-[#0f1420] overflow-hidden" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              {logoUrl ? (
                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-white">{getInitials(biz.businessName)}</span>
              )}
            </div>
          </div>
          <div className="px-5 pb-5">
            <h3 className="text-base font-black text-foreground mb-1">{biz.businessName}</h3>
            {biz.description && (
              <p className="text-xs text-muted-foreground font-medium mb-3 leading-relaxed line-clamp-3">{biz.description}</p>
            )}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
              <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full", vsc.bg, vsc.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", vsc.dot)} />{vsc.label}
              </span>
              {biz.ownershipType && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0F69B0]/10 text-[#0F69B0]">{biz.ownershipType}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-black text-foreground">{biz.averageRating}</span>
            </div>
            {isPending && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center">
                <button
                  onClick={() => setVerifyDialog({ open: true, action: "approve" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40"
                >
                  <CheckCircle className="h-3.5 w-3.5" />Approve
                </button>
                <button
                  onClick={() => setVerifyDialog({ open: true, action: "reject" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
                >
                  <XCircle className="h-3.5 w-3.5" />Reject
                </button>
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
                <Building className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Business Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {infoFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                      <Icon className="h-3.5 w-3.5 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{field.label}</p>
                      <p className="text-xs font-bold text-foreground break-all">{field.value || "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Documents</h3>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto", biz.isDocumentUploaded ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600")}>
                {biz.isDocumentUploaded ? "Uploaded" : "Pending"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <DocCard label="Trade License" filename={biz.tradeLicense} />
              <DocCard label="National ID / Passport" filename={biz.nationalIdOrPassport} />
              <DocCard label="Tax Certificate" filename={biz.taxCertificate} />
            </div>
            {logoUrl && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Business Logo</p>
                <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={verifyDialog.open}
        onClose={() => setVerifyDialog({ open: false, action: null })}
        onConfirm={() => handleVerify(verifyDialog.action)}
        title={verifyDialog.action === "approve" ? "Approve Verification" : "Reject Verification"}
        description={`Are you sure you want to ${verifyDialog.action === "approve" ? "verify" : "reject"} "${biz.businessName}"?`}
        confirmLabel={verifyDialog.action === "approve" ? "Approve" : "Reject"}
        isLoading={isProcessing}
        variant={verifyDialog.action === "approve" ? "primary" : "danger"}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false })}
        onConfirm={handleDelete}
        title="Delete Business"
        description={`Are you sure you want to delete "${biz.businessName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isProcessing}
        variant="danger"
      />
    </div>
  );
}