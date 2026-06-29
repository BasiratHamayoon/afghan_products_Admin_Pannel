"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Trash2, Loader2, XCircle,
  Calendar, MapPin, DollarSign, Handshake,
  Building2, User, Mail, Tag, FileText,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchPartnerById,
  deletePartner,
  clearPartnerByIdCache,
} from "@/store/actions/partnersActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const APPROVAL_CONFIG = {
  PENDING: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  APPROVED: { label: "Approved", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  REJECTED: { label: "Rejected", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
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
  const [isDeleting, setIsDeleting] = useState(false);

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
      try {
        const res = await dispatch(fetchPartnerById(id));
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

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) { setDeleteDialog(false); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deletePartner(itemData.id));
      if (res?.success) {
        toast.success("Partner deleted");
        clearPartnerByIdCache(itemData.id);
        router.push("/partners");
      } else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog(false); }
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
        <h2 className="text-lg font-black text-foreground">Partner not found</h2>
        <button
          onClick={() => router.push("/partners")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </div>
    );
  }

  const approval = APPROVAL_CONFIG[itemData.approvalStatus] || APPROVAL_CONFIG.PENDING;
  const logoUrl = itemData.logo ? getFileUrl(itemData.logo) : null;

  const detailFields = [
    { label: "Title", value: itemData.title, icon: FileText },
    { label: "Category", value: itemData.businessCategory || "—", icon: Tag },
    { label: "Partnership Type", value: itemData.partnershipType || "—", icon: Handshake },
    { label: "Min Investment", value: formatAmount(itemData.investmentRangeMin), icon: DollarSign },
    { label: "Max Investment", value: formatAmount(itemData.investmentRangeMax), icon: DollarSign },
    {
      label: "Equity Offered",
      value: itemData.equityOffered?.min !== null
        ? `${itemData.equityOffered?.min ?? "—"}% - ${itemData.equityOffered?.max ?? "—"}%`
        : "—",
      icon: FileText,
    },
    { label: "Tag", value: itemData.tag || "—", icon: Tag },
    { label: "City", value: itemData.city || "—", icon: MapPin },
    { label: "Country", value: itemData.country || "—", icon: MapPin },
    { label: "Business", value: itemData.businessName || "—", icon: Building2 },
    { label: "Owner", value: itemData.ownerName || "—", icon: User },
    { label: "Owner Email", value: itemData.ownerEmail || "—", icon: Mail },
    { label: "Created", value: formatDate(itemData.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Partner Detail" description={itemData.title || ""}>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/partners")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {logoUrl ? (
              <img src={logoUrl} alt={itemData.title} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <span className="text-4xl">🤝</span>
            )}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{itemData.title}</h3>
          {itemData.businessName && <p className="text-xs text-muted-foreground font-medium">{itemData.businessName}</p>}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5" />
            {[itemData.city, itemData.country].filter(Boolean).join(", ")}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full", approval.bg, approval.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", approval.dot)} />
              {approval.label}
            </span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600">
              {itemData.partnershipType}
            </span>
          </div>

          <div className="w-full mt-5 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Investment Range</p>
            <p className="text-sm font-black text-foreground">
              {formatAmount(itemData.investmentRangeMin)} - {formatAmount(itemData.investmentRangeMax)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center">
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">Partner Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                      <Icon className="h-4 w-4 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{f.label}</p>
                      <p className="text-sm font-bold text-foreground break-all">{f.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {itemData.description && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">Description</h3>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{itemData.description}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDeleteConfirm} title="Delete Partner" description={`Delete "${itemData?.title}"? This cannot be undone.`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}

export default function PartnerDetailPage() {
  return <Suspense fallback={null}><DetailContent /></Suspense>;
}