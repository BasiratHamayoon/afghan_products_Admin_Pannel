"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Loader2, XCircle,
  Calendar, MapPin, Globe, Mail, Phone,
  User, Tag, Star, Hash, FileText, CheckCircle,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchTradeShowById,
  deleteTradeShow,
  clearTradeShowByIdCache,
} from "@/store/actions/tradeShowsActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
        const res = await dispatch(fetchTradeShowById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          setItemData(res.data);
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

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) { setDeleteDialog(false); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteTradeShow(itemData.id));
      if (res?.success) {
        toast.success("Trade show deleted");
        clearTradeShowByIdCache(itemData.id);
        router.push("/trade-shows");
      } else {
        toast.error(res?.message || "Failed to delete");
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading trade show...</p>
        </div>
      </div>
    );
  }

  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Trade show not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The item does not exist or has been deleted.</p>
        <button onClick={() => router.push("/trade-shows")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </div>
    );
  }

  const imageUrl = itemData.image ? getFileUrl(itemData.image) : null;

  const getStatus = () => {
    if (!itemData.isActive) return { label: "Inactive", cls: "bg-gray-500/10 text-gray-500" };
    const now = new Date();
    const s = new Date(itemData.startDate);
    const e = new Date(itemData.endDate);
    if (now < s) return { label: "Upcoming", cls: "bg-blue-500/10 text-blue-600" };
    if (now >= s && now <= e) return { label: "Ongoing", cls: "bg-emerald-500/10 text-emerald-600" };
    return { label: "Ended", cls: "bg-amber-500/10 text-amber-600" };
  };
  const status = getStatus();

  const detailFields = [
    { label: "Title", value: itemData.title, icon: FileText },
    { label: "Country", value: itemData.country, icon: MapPin },
    { label: "City", value: itemData.city, icon: MapPin },
    { label: "Venue", value: itemData.venue || "—", icon: MapPin },
    { label: "Address", value: itemData.address || "—", icon: MapPin },
    { label: "Start Date", value: formatDate(itemData.startDate), icon: Calendar },
    { label: "End Date", value: formatDate(itemData.endDate), icon: Calendar },
    { label: "Organizer", value: itemData.organizer || "—", icon: User },
    { label: "Email", value: itemData.organizerEmail || "—", icon: Mail },
    { label: "Phone", value: itemData.organizerPhone || "—", icon: Phone },
    { label: "Website", value: itemData.website || "—", icon: Globe },
    { label: "Category", value: itemData.category || "—", icon: Tag },
    { label: "Created", value: formatDate(itemData.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Trade Show Detail" description={itemData.title || ""}>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/trade-shows")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/trade-shows/add?edit=${id}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />Edit
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Image & Summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt={itemData.title} className="object-cover w-full h-full" />
            ) : (
              <span className="text-5xl">🎪</span>
            )}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{itemData.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5" />
            {[itemData.city, itemData.country].filter(Boolean).join(", ")}
          </div>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", status.cls)}>
              {status.label}
            </span>
            {itemData.isFeatured && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-500" />Featured
              </span>
            )}
          </div>

          {itemData.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
              {itemData.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button onClick={() => router.push(`/trade-shows/add?edit=${id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
              <Edit2 className="h-3.5 w-3.5" />Edit
            </button>
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          </div>
        </motion.div>

        {/* Right — Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">
          {/* Detail fields */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">Trade Show Information</h3>
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
                      <p className="text-sm font-bold text-foreground break-all">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {itemData.description && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">Description</h3>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{itemData.description}</p>
              </div>
            </div>
          )}

          {/* Gallery */}
          {itemData.gallery?.length > 0 && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">Gallery ({itemData.gallery.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {itemData.gallery.map((img, i) => (
                  <div key={i} className="h-32 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                    <img src={getFileUrl(img)} alt={`Gallery ${i + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Trade Show"
        description={`Are you sure you want to permanently delete "${itemData?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function TradeShowDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailContent />
    </Suspense>
  );
}