"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Loader2, XCircle,
  Calendar, FileText, Image, MapPin, Link2,
  Hash, ToggleLeft, ToggleRight, Eye,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchBannerById, deleteBanner, toggleBannerStatus, clearBannerByIdCache,
} from "@/store/actions/bannersActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const POSITION_LABELS = {
  HOME_TOP: "Home Top", HOME_MIDDLE: "Home Middle", HOME_BOTTOM: "Home Bottom",
  CATEGORY_TOP: "Category Top", PRODUCT_TOP: "Product Top", SIDEBAR: "Sidebar",
};

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [toggleDialog, setToggleDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchBannerById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) setItemData(res.data);
        else setNotFound(true);
      } catch { if (isMountedRef.current) setNotFound(true); }
      finally { if (isMountedRef.current) setIsFetching(false); }
    };
    load();
  }, [id, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) { setDeleteDialog(false); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteBanner(itemData.id));
      if (res?.success) { toast.success("Banner deleted"); clearBannerByIdCache(itemData.id); router.push("/banners"); }
      else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog(false); }
  };

  const handleToggleConfirm = async () => {
    if (!itemData?.id) { setToggleDialog(false); return; }
    setIsToggling(true);
    try {
      const res = await dispatch(toggleBannerStatus(itemData.id));
      if (res?.success) {
        toast.success(itemData.isActive ? "Deactivated" : "Activated");
        setItemData((prev) => prev ? { ...prev, isActive: !prev.isActive } : prev);
        clearBannerByIdCache(itemData.id);
      } else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsToggling(false); setToggleDialog(false); }
  };

  if (isFetching) return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" /></div>;

  if (notFound || !itemData) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div>
      <h2 className="text-lg font-black text-foreground">Banner not found</h2>
      <button onClick={() => router.push("/banners")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><ArrowLeft className="h-4 w-4" />Back</button>
    </div>
  );

  const mediaUrl = itemData.media ? getFileUrl(itemData.media) : null;

  const fields = [
    { label: "Title", value: itemData.title, icon: FileText },
    { label: "Subtitle", value: itemData.subtitle || "—", icon: FileText },
    { label: "Position", value: POSITION_LABELS[itemData.position] || itemData.position, icon: MapPin },
    { label: "Media Type", value: itemData.mediaType, icon: Image },
    { label: "Link Type", value: itemData.linkType || "none", icon: Link2 },
    { label: "Link Value", value: itemData.linkValue || "—", icon: Link2 },
    { label: "Sort Order", value: String(itemData.sortOrder ?? 0), icon: Hash },
    { label: "Status", value: itemData.isActive ? "Active" : "Inactive", icon: Eye, isStatus: true },
    { label: "Start Date", value: itemData.startDate ? formatDate(itemData.startDate) : "—", icon: Calendar },
    { label: "End Date", value: itemData.endDate ? formatDate(itemData.endDate) : "—", icon: Calendar },
    { label: "Created", value: formatDate(itemData.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Banner Detail" description={itemData.title || ""}>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/banners")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer"><ArrowLeft className="h-4 w-4" />Back</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/banners/add?edit=${id}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Edit2 className="h-4 w-4" />Edit</motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Preview */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {mediaUrl ? <img src={mediaUrl} alt={itemData.title} className="object-cover w-full h-full" /> : <span className="text-5xl">🖼️</span>}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{itemData.title}</h3>
          {itemData.subtitle && <p className="text-xs text-muted-foreground font-medium mt-1">{itemData.subtitle}</p>}

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", itemData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>{itemData.isActive ? "Active" : "Inactive"}</span>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-600">{POSITION_LABELS[itemData.position] || itemData.position}</span>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button onClick={() => router.push(`/banners/add?edit=${id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] cursor-pointer border border-[#0F69B0]/20"><Edit2 className="h-3.5 w-3.5" />Edit</button>
            <button onClick={() => setToggleDialog(true)} className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border", itemData.isActive ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-amber-200 dark:border-amber-800/40" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40")}>
              {itemData.isActive ? <><ToggleRight className="h-3.5 w-3.5" />Deactivate</> : <><ToggleLeft className="h-3.5 w-3.5" />Activate</>}
            </button>
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
          </div>
        </motion.div>

        {/* Right — Details */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
          <h3 className="text-sm font-black text-foreground mb-5">Banner Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}><Icon className="h-4 w-4 text-[#0F69B0]" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{f.label}</p>
                    {f.isStatus ? (
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", itemData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", itemData.isActive ? "bg-emerald-500" : "bg-gray-400")} />{f.value}
                      </span>
                    ) : <p className="text-sm font-bold text-foreground break-all">{f.value}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDeleteConfirm} title="Delete Banner" description={`Delete "${itemData?.title}"? This cannot be undone.`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
      <ConfirmDialog open={toggleDialog} onClose={() => setToggleDialog(false)} onConfirm={handleToggleConfirm} title={itemData?.isActive ? "Deactivate Banner" : "Activate Banner"} description={`Are you sure you want to ${itemData?.isActive ? "deactivate" : "activate"} "${itemData?.title}"?`} confirmLabel={itemData?.isActive ? "Deactivate" : "Activate"} isLoading={isToggling} variant={itemData?.isActive ? "warning" : "primary"} />
    </div>
  );
}

export default function BannerDetailPage() {
  return <Suspense fallback={null}><DetailContent /></Suspense>;
}