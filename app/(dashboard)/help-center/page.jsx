"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, HelpCircle, RefreshCw, Trash2, Edit2, Eye,
  MessageSquare, FolderOpen, Phone,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchHelpCenter,
  deleteHelpCenter,
  deleteFaq,
  deleteHelpCategory,
  deleteContactOption,
} from "@/store/actions/helpCenterActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function HelpCenterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { helpCenter, faqs, categories, contactOptions, isLoading } = useSelector((state) => state.helpCenter);

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFetchedRef = useRef(false);

  const TABS = [
    { id: "overview", label: t("helpCenter.overview") },
    { id: "faqs", label: t("helpCenter.faqs") },
    { id: "categories", label: t("helpCenter.categories") },
    { id: "contact", label: t("helpCenter.contactOptions") },
  ];

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchHelpCenter());
  }, [dispatch]);

  const handleRefresh = () => dispatch(fetchHelpCenter());
  const hasContent = !!helpCenter;

  const handleDeleteConfirm = async () => {
    const { type, item } = deleteDialog;
    if (!item) { setDeleteDialog({ open: false, type: null, item: null }); return; }
    setIsDeleting(true);
    try {
      let res;
      const itemId = item._id || item.id;
      if (type === "helpCenter") res = await dispatch(deleteHelpCenter(itemId));
      else if (type === "faq") res = await dispatch(deleteFaq(itemId));
      else if (type === "category") res = await dispatch(deleteHelpCategory(itemId));
      else if (type === "contact") res = await dispatch(deleteContactOption(itemId));
      if (res?.success) {
        toast.success(t("helpCenter.deletedSuccessfully"));
        if (type !== "helpCenter") dispatch(fetchHelpCenter());
      } else {
        toast.error(res?.message || t("helpCenter.failedToDelete"));
      }
    } catch {
      toast.error(t("helpCenter.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, type: null, item: null });
    }
  };

  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const safeCats = Array.isArray(categories) ? categories : [];
  const safeContacts = Array.isArray(contactOptions) ? contactOptions : [];

  const tabCounts = {
    overview: 1,
    faqs: safeFaqs.length,
    categories: safeCats.length,
    contact: safeContacts.length,
  };

  const getDeleteTitle = (type) => {
    if (type === "faq") return `${t("helpCenter.deleteTitle")} ${t("helpCenter.deleteFaq")}`;
    if (type === "category") return `${t("helpCenter.deleteTitle")} ${t("helpCenter.deleteCategory")}`;
    if (type === "contact") return `${t("helpCenter.deleteTitle")} ${t("helpCenter.deleteContact")}`;
    return `${t("helpCenter.deleteTitle")} ${t("helpCenter.deleteHelpCenter")}`;
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("helpCenter.title")} description={t("helpCenter.description")}>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {!hasContent && !isLoading && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/help-center/add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              <Plus className="h-4 w-4" />{t("helpCenter.createHelpCenter")}
            </motion.button>
          )}
          {hasContent && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/help-center/add?edit=${helpCenter.id}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              <Edit2 className="h-4 w-4" />{t("helpCenter.edit")}
            </motion.button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("helpCenter.faqs")} value={safeFaqs.length} icon={MessageSquare} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("helpCenter.categories")} value={safeCats.length} icon={FolderOpen} color="rgba(124,58,237,0.08)" index={1} />
        <StatsCard title={t("helpCenter.contactOptions")} value={safeContacts.length} icon={Phone} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title={t("helpCenter.status")} value={hasContent ? (helpCenter?.isActive ? t("helpCenter.active") : t("helpCenter.inactive")) : t("helpCenter.none")} icon={HelpCircle} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", activeTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}
            >
              {tab.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("helpCenter.loadingHelpCenter")} className="py-16" />
          ) : !hasContent && activeTab === "overview" ? (
            <EmptyState
              icon={HelpCircle}
              title={t("helpCenter.noHelpCenterContent")}
              description={t("helpCenter.noHelpCenterDesc")}
              action={
                <button onClick={() => router.push("/help-center/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Plus className="h-4 w-4" />{t("helpCenter.createHelpCenter")}
                </button>
              }
            />
          ) : activeTab === "overview" && hasContent ? (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-foreground">{helpCenter.headerTitle || t("helpCenter.title")}</h2>
                  {helpCenter.headerSubtitle && <p className="text-sm text-muted-foreground font-medium mt-0.5">{helpCenter.headerSubtitle}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", helpCenter.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                      {helpCenter.isActive ? t("helpCenter.active") : t("helpCenter.inactive")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("helpCenter.updated")} {formatDate(helpCenter.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => router.push(`/help-center/${helpCenter.id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
                    <Eye className="h-3.5 w-3.5" />{t("helpCenter.view")}
                  </button>
                  <button onClick={() => setDeleteDialog({ open: true, type: "helpCenter", item: helpCenter })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                    <Trash2 className="h-3.5 w-3.5" />{t("helpCenter.delete")}
                  </button>
                </div>
              </div>

              {helpCenter.heroTitle && (
                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("helpCenter.hero")}</p>
                  <p className="text-sm font-bold text-foreground">{helpCenter.heroTitle}</p>
                  {helpCenter.heroDescription && <p className="text-xs text-muted-foreground font-medium mt-1">{helpCenter.heroDescription}</p>}
                </div>
              )}

              {helpCenter.supportTitle && (
                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t("helpCenter.support")}</p>
                  <p className="text-sm font-bold text-foreground">{helpCenter.supportTitle}</p>
                  {helpCenter.supportDescription && <p className="text-xs text-muted-foreground font-medium mt-1">{helpCenter.supportDescription}</p>}
                </div>
              )}
            </div>
          ) : activeTab === "faqs" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-black text-foreground">{t("helpCenter.faqs")} ({safeFaqs.length})</h3>
                <button onClick={() => router.push("/help-center/add-faq")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
                  <Plus className="h-3 w-3" />{t("helpCenter.addFaq")}
                </button>
              </div>
              {safeFaqs.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium py-8 text-center">{t("helpCenter.noFaqsYet")}</p>
              ) : (
                <div className="space-y-3">
                  {safeFaqs.map((faq, i) => (
                    <div key={faq._id || faq.id || i} className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 w-full">
                          <p className="text-sm font-bold text-foreground break-words">{faq.question || "—"}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-2 break-words">{faq.answer || "—"}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {faq.category && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 truncate max-w-[120px]">{faq.category}</span>}
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", faq.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>{faq.isActive ? t("helpCenter.active") : t("helpCenter.inactive")}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{t("helpCenter.order")} {faq.order ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => router.push(`/help-center/add-faq?edit=${faq._id || faq.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("helpCenter.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteDialog({ open: true, type: "faq", item: faq })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("helpCenter.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "categories" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-black text-foreground">{t("helpCenter.categories")} ({safeCats.length})</h3>
                <button onClick={() => router.push("/help-center/add-category")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
                  <Plus className="h-3 w-3" />{t("helpCenter.addCategory")}
                </button>
              </div>
              {safeCats.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium py-8 text-center">{t("helpCenter.noCategoriesYet")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {safeCats.map((cat, i) => (
                    <div key={cat._id || cat.id || i} className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            {cat.icon && <span className="text-[11px] font-bold text-[#0F69B0] bg-[#0F69B0]/10 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[80px]">{cat.icon}</span>}
                            <p className="text-sm font-bold text-foreground truncate">{cat.title || "—"}</p>
                          </div>
                          {cat.description && <p className="text-xs text-muted-foreground font-medium mt-1.5 line-clamp-2 break-words">{cat.description}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", cat.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>{cat.isActive ? t("helpCenter.active") : t("helpCenter.inactive")}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{t("helpCenter.order")} {cat.order ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => router.push(`/help-center/add-category?edit=${cat._id || cat.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("helpCenter.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteDialog({ open: true, type: "category", item: cat })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("helpCenter.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === "contact" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-black text-foreground">{t("helpCenter.contactOptions")} ({safeContacts.length})</h3>
                <button onClick={() => router.push("/help-center/add-contact")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
                  <Plus className="h-3 w-3" />{t("helpCenter.addContact")}
                </button>
              </div>
              {safeContacts.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium py-8 text-center">{t("helpCenter.noContactOptionsYet")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {safeContacts.map((co, i) => (
                    <div key={co._id || co.id || i} className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center gap-2 flex-wrap">
                            {co.icon && <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[80px]">{co.icon}</span>}
                            <p className="text-sm font-bold text-foreground truncate">{co.title || "—"}</p>
                          </div>
                          {co.description && <p className="text-xs text-muted-foreground font-medium mt-1.5 line-clamp-2 break-words">{co.description}</p>}
                          {co.value && <p className="text-xs text-[#0F69B0] font-medium mt-1 truncate">{co.value}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {co.type && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 shrink-0 truncate max-w-[80px]">{co.type}</span>}
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", co.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>{co.isActive ? t("helpCenter.active") : t("helpCenter.inactive")}</span>
                            <span className="text-[10px] text-muted-foreground shrink-0">{t("helpCenter.order")} {co.order ?? 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => router.push(`/help-center/add-contact?edit=${co._id || co.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("helpCenter.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setDeleteDialog({ open: true, type: "contact", item: co })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("helpCenter.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: null, item: null })}
        onConfirm={handleDeleteConfirm}
        title={getDeleteTitle(deleteDialog.type)}
        description={t("helpCenter.deleteDesc")}
        confirmLabel={t("helpCenter.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}