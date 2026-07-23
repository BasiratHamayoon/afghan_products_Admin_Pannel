"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Shield, Clock, CheckCircle, XCircle,
  X, Building, Eye, Star, FileText, Trash2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchPendingSellers,
  fetchVerifiedSellers,
  fetchBusinesses,
  updateVerificationStatus,
  deleteBusinessAction,
} from "@/store/actions/businessesActions";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const PAGE_LIMIT = 10;

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function VerificationsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { pendingSellers, verifiedSellers, businesses, isLoading } = useSelector(
    (state) => state.businesses
  );

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [verifyDialog, setVerifyDialog] = useState({ open: false, business: null, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, business: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const debounceRef = useRef(null);
  const hasFetched = useRef(false);

  const TABS = [
    { id: "all", label: t("verifications.allBusinesses"), icon: Building },
    { id: "pending", label: t("verifications.pending"), icon: Clock },
    { id: "verified", label: t("verifications.verified"), icon: CheckCircle },
  ];

  const vStatusConfig = {
    VERIFIED: { label: t("verifications.statusVerified"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    PENDING: { label: t("verifications.statusPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    REJECTED: { label: t("verifications.statusRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
    UNVERIFIED: { label: t("verifications.statusUnverified"), bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchBusinesses({ page: 1, limit: 100 }));
    dispatch(fetchPendingSellers());
    dispatch(fetchVerifiedSellers());
  }, [dispatch]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(val); }, 400);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setDebouncedSearch("");
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleVerifyConfirm = async () => {
    const { business, action } = verifyDialog;
    if (!business?.id) { setVerifyDialog({ open: false, business: null, action: null }); return; }
    setIsProcessing(true);
    try {
      const res = await dispatch(updateVerificationStatus(business.id, action));
      if (res?.success) {
        toast.success(action === "approve" ? t("verifications.businessVerified") : t("verifications.businessRejected"));
      } else {
        toast.error(res?.message || t("verifications.actionFailed"));
      }
    } catch {
      toast.error(t("verifications.somethingWentWrong"));
    } finally {
      setIsProcessing(false);
      setVerifyDialog({ open: false, business: null, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    const { business } = deleteDialog;
    if (!business?.id) { setDeleteDialog({ open: false, business: null }); return; }
    setIsProcessing(true);
    try {
      const res = await dispatch(deleteBusinessAction(business.id));
      if (res?.success) {
        toast.success(t("verifications.businessDeleted"));
      } else {
        toast.error(res?.message || t("verifications.deleteFailed"));
      }
    } catch {
      toast.error(t("verifications.somethingWentWrong"));
    } finally {
      setIsProcessing(false);
      setDeleteDialog({ open: false, business: null });
    }
  };

  const handleViewDetail = useCallback((biz) => {
    const bizId = biz?.id || biz?._id;
    if (!bizId) { toast.error(t("verifications.businessIdNotFound")); return; }
    router.push(`/verifications/${bizId}`);
  }, [router, t]);

  const getDisplayData = useCallback(() => {
    let data = [];
    if (activeTab === "all") data = Array.isArray(businesses) ? businesses : [];
    else if (activeTab === "pending") data = Array.isArray(pendingSellers) ? pendingSellers : [];
    else if (activeTab === "verified") data = Array.isArray(verifiedSellers) ? verifiedSellers : [];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(
        (b) =>
          b.businessName?.toLowerCase().includes(q) ||
          b.ownerName?.toLowerCase().includes(q) ||
          b.ownerEmail?.toLowerCase().includes(q) ||
          b.ownershipType?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeTab, businesses, pendingSellers, verifiedSellers, debouncedSearch]);

  const displayData = getDisplayData();
  const total = displayData.length;
  const totalPages = Math.ceil(total / PAGE_LIMIT) || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);
  const paginatedData = displayData.slice((currentPage - 1) * PAGE_LIMIT, currentPage * PAGE_LIMIT);

  const tabCounts = {
    all: Array.isArray(businesses) ? businesses.length : 0,
    pending: Array.isArray(pendingSellers) ? pendingSellers.length : 0,
    verified: Array.isArray(verifiedSellers) ? verifiedSellers.length : 0,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("verifications.title")} description={t("verifications.description")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("verifications.allBusinesses")} value={tabCounts.all} icon={Building} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("verifications.pending")} value={tabCounts.pending} icon={Clock} color="rgba(245,158,11,0.08)" index={1} />
        <StatsCard title={t("verifications.verified")} value={tabCounts.verified} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title={t("verifications.totalRequests")} value={tabCounts.pending + tabCounts.verified} icon={Shield} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                  activeTab === tab.id
                    ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
                <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("verifications.searchPlaceholder")} />
            </div>
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />
                {t("verifications.clear")}
              </button>
            )}
            <p className="text-[11px] text-muted-foreground font-medium">
              {total} {total !== 1 ? t("verifications.resultsPlural") : t("verifications.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("verifications.loading")} className="py-16" />
          ) : paginatedData.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={t("verifications.noRecordsFound")}
              description={
                activeTab === "pending"
                  ? t("verifications.noPendingRequests")
                  : activeTab === "verified"
                  ? t("verifications.noVerifiedSellers")
                  : debouncedSearch
                  ? t("verifications.tryAdjustingSearch")
                  : t("verifications.noBusinessesFound")
              }
              action={debouncedSearch ? (
                <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  {t("verifications.clearSearch")}
                </button>
              ) : null}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
                      {[
                        t("verifications.business"),
                        t("verifications.owner"),
                        t("verifications.type"),
                        t("verifications.documents"),
                        t("verifications.rating"),
                        t("verifications.status"),
                        t("verifications.actions"),
                      ].map((h) => (
                        <th key={h} className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((biz, i) => {
                      const vs = biz.verificationStatus || "UNVERIFIED";
                      const vsc = vStatusConfig[vs] || vStatusConfig.UNVERIFIED;
                      const logoUrl = biz.logo ? getFileUrl(biz.logo) : null;
                      const docCount = [biz.tradeLicense, biz.nationalIdOrPassport, biz.taxCertificate].filter(Boolean).length;

                      return (
                        <motion.tr
                          key={biz.id || biz._id || i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(15,105,176,0.15)] overflow-hidden" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                                {logoUrl ? (
                                  <img src={logoUrl} alt={biz.businessName} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-black text-white">{getInitials(biz.businessName)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate max-w-[160px]">{biz.businessName || "—"}</p>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                  {t("verifications.est")} {biz.yearOfEstablishment || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-xs font-semibold text-foreground whitespace-nowrap">{biz.ownerName || "—"}</p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">{biz.ownerEmail || "—"}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0F69B0]/10 text-[#0F69B0] whitespace-nowrap">
                              {biz.ownershipType || "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                              <span className="text-xs font-bold text-foreground">{docCount}/3</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-foreground">{biz.averageRating || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", vsc.bg, vsc.text)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", vsc.dot)} />
                              {vsc.label}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleViewDetail(biz)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("verifications.viewDetails")}>
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              {(vs === "PENDING" || vs === "UNVERIFIED") && (
                                <>
                                  <button onClick={() => setVerifyDialog({ open: true, business: biz, action: "approve" })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer" title={t("verifications.approve")}>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => setVerifyDialog({ open: true, business: biz, action: "reject" })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("verifications.reject")}>
                                    <XCircle className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => setDeleteDialog({ open: true, business: biz })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("verifications.delete")}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={verifyDialog.open}
        onClose={() => setVerifyDialog({ open: false, business: null, action: null })}
        onConfirm={handleVerifyConfirm}
        title={verifyDialog.action === "approve" ? t("verifications.approveVerification") : t("verifications.rejectVerification")}
        description={verifyDialog.business ? `${verifyDialog.action === "approve" ? t("verifications.approveDesc") : t("verifications.rejectDesc")} "${verifyDialog.business.businessName}"?` : t("verifications.areYouSure")}
        confirmLabel={verifyDialog.action === "approve" ? t("verifications.approve") : t("verifications.reject")}
        isLoading={isProcessing}
        variant={verifyDialog.action === "approve" ? "primary" : "danger"}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, business: null })}
        onConfirm={handleDeleteConfirm}
        title={t("verifications.deleteBusiness")}
        description={deleteDialog.business ? `${t("verifications.deleteBusinessDesc")} "${deleteDialog.business.businessName}"${t("verifications.deleteBusinessSuffix")}` : t("verifications.areYouSure")}
        confirmLabel={t("verifications.delete")}
        isLoading={isProcessing}
        variant="danger"
      />
    </div>
  );
}