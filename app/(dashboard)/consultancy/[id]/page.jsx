"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Loader2, XCircle,
  Calendar, DollarSign, Star, GraduationCap,
  Globe, Hash, FileText, CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchConsultantById,
  deleteConsultant,
  clearConsultantByIdCache,
} from "@/store/actions/consultancyActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const DAYS_LABEL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-4 w-4", s <= Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-white/20")} />
      ))}
    </div>
  );
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

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchConsultantById(id));
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
      const res = await dispatch(deleteConsultant(itemData.id));
      if (res?.success) {
        toast.success("Deleted");
        clearConsultantByIdCache(itemData.id);
        router.push("/consultancy");
      } else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog(false); }
  };

  if (isFetching) return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" /></div>;

  if (notFound || !itemData) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div>
      <h2 className="text-lg font-black text-foreground">Consultant not found</h2>
      <button onClick={() => router.push("/consultancy")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><ArrowLeft className="h-4 w-4" />Back</button>
    </div>
  );

  const imgUrl = itemData.profileImage ? getFileUrl(itemData.profileImage) : null;

  const detailFields = [
    { label: "Name", value: itemData.name, icon: FileText },
    { label: "Title", value: itemData.title, icon: FileText },
    { label: "Specialization", value: itemData.specialization || "—", icon: GraduationCap },
    { label: "Min Rate", value: `$${itemData.hourlyRateMin}/hr`, icon: DollarSign },
    { label: "Max Rate", value: `$${itemData.hourlyRateMax}/hr`, icon: DollarSign },
    { label: "Total Sessions", value: String(itemData.totalSessions ?? 0), icon: Hash },
    { label: "Status", value: itemData.isActive ? "Active" : "Inactive", icon: CheckCircle, isStatus: true },
    { label: "Created", value: formatDate(itemData.createdAt), icon: Calendar },
    { label: "Updated", value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Consultant Detail" description={itemData.name || ""}>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/consultancy")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/consultancy/add?edit=${id}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />Edit
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {imgUrl ? <img src={imgUrl} alt={itemData.name} className="object-cover w-full h-full" /> : <span className="text-3xl font-black text-muted-foreground">{itemData.name?.charAt(0) || "?"}</span>}
          </div>
          <h3 className="text-lg font-black text-foreground mb-0.5">{itemData.name}</h3>
          <p className="text-xs text-muted-foreground font-medium">{itemData.title}</p>
          <div className="mt-3"><RatingStars rating={itemData.rating} /></div>
          <p className="text-xs text-muted-foreground font-medium mt-1">{Number(itemData.rating).toFixed(1)} rating · {itemData.totalSessions} sessions</p>

          <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full mt-3", itemData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
            {itemData.isActive ? "Active" : "Inactive"}
          </span>

          {itemData.languages?.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 flex-wrap justify-center">
              <Globe className="h-3.5 w-3.5 text-muted-foreground/50" />
              {itemData.languages.map((l, i) => (
                <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">{l}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button onClick={() => router.push(`/consultancy/add?edit=${id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] cursor-pointer border border-[#0F69B0]/20"><Edit2 className="h-3.5 w-3.5" />Edit</button>
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40"><Trash2 className="h-3.5 w-3.5" />Delete</button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">Consultant Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((f) => {
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
          </div>

          {itemData.description && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">Description</h3>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{itemData.description}</p>
              </div>
            </div>
          )}

          {itemData.availability?.length > 0 && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">Availability</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemData.availability.map((avail, i) => (
                  <div key={i} className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <p className="text-xs font-black text-foreground mb-2">{DAYS_LABEL[avail.day] || avail.day}</p>
                    <div className="space-y-1">
                      {avail.slots?.map((slot, si) => (
                        <div key={si} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                          <span>{slot.start}</span>
                          <span>→</span>
                          <span>{slot.end}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDeleteConfirm} title="Delete Consultant" description={`Delete "${itemData?.name}"? This cannot be undone.`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}

export default function ConsultantDetailPage() {
  return <Suspense fallback={null}><DetailContent /></Suspense>;
}