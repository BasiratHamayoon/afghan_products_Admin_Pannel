"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Handshake, X, RefreshCw, CheckCircle, Clock, XCircle, Users, FileText } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PartnersTable from "@/components/partners/PartnersTable";
import PartnershipRequestsTable from "@/components/partners/PartnershipRequestsTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ReviewRequestModal from "@/components/partners/ReviewRequestModal";
import { fetchPartners, fetchPartnershipRequests, deletePartner, reviewPartnershipRequest } from "@/store/actions/partnersActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 20;

export default function PartnersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { partners, partnershipRequests, isLoading, isRequestsLoading, partnersPagination, requestsPagination } = useSelector((state) => state.partners);

  const [mainTab, setMainTab] = useState("partners");
  const [partnerTab, setPartnerTab] = useState("all");
  const [requestTab, setRequestTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPartnersPage, setCurrentPartnersPage] = useState(1);
  const [currentRequestsPage, setCurrentRequestsPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [reviewModal, setReviewModal] = useState({ open: false, item: null, action: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const MAIN_TABS = [
    { id: "partners", label: t("partners.partnerListings") },
    { id: "requests", label: t("partners.partnershipRequests") },
  ];

  const PARTNER_TABS = [
    { id: "all", label: t("partners.all") },
    { id: "approved", label: t("partners.approved") },
    { id: "pending", label: t("partners.pending") },
    { id: "rejected", label: t("partners.rejected") },
  ];

  const REQUEST_TABS = [
    { id: "all", label: t("partners.all") },
    { id: "approved", label: t("partners.approved") },
    { id: "pending", label: t("partners.pending") },
    { id: "rejected", label: t("partners.rejected") },
  ];

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchPartners({ page: 1, limit: PAGE_LIMIT }));
    dispatch(fetchPartnershipRequests({ page: 1, limit: PAGE_LIMIT }));
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleRefresh = () => {
    dispatch(fetchPartners({ page: currentPartnersPage, limit: PAGE_LIMIT, search: searchQuery }));
    dispatch(fetchPartnershipRequests({ page: currentRequestsPage, limit: PAGE_LIMIT }));
  };

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPartnersPage(1);
      dispatch(fetchPartners({ page: 1, limit: PAGE_LIMIT, search: val }));
    }, DEBOUNCE_DELAY);
  }, [dispatch]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPartnersPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    dispatch(fetchPartners({ page: 1, limit: PAGE_LIMIT }));
  };

  const handlePartnersPageChange = (page) => {
    setCurrentPartnersPage(page);
    dispatch(fetchPartners({ page, limit: PAGE_LIMIT, search: searchQuery }));
  };

  const handleRequestsPageChange = (page) => {
    setCurrentRequestsPage(page);
    const status = requestTab !== "all" ? requestTab : undefined;
    dispatch(fetchPartnershipRequests({ page, limit: PAGE_LIMIT, status }));
  };

  const handleRequestTabChange = (tab) => {
    setRequestTab(tab);
    setCurrentRequestsPage(1);
    const status = tab !== "all" ? tab : undefined;
    dispatch(fetchPartnershipRequests({ page: 1, limit: PAGE_LIMIT, status }));
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deletePartner(item.id));
      if (res?.success) toast.success(t("partners.partnerDeleted"));
      else toast.error(res?.message || t("partners.failedAction"));
    } catch {
      toast.error(t("partners.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const handleReviewSubmit = async (approvalStatus, adminNote) => {
    const { item } = reviewModal;
    if (!item?.id) { setReviewModal({ open: false, item: null, action: null }); return; }
    setIsReviewing(true);
    try {
      const res = await dispatch(reviewPartnershipRequest(item.id, approvalStatus, adminNote));
      if (res?.success) {
        toast.success(approvalStatus === "approved" ? t("partners.requestApproved") : t("partners.requestRejected"));
      } else {
        toast.error(res?.message || t("partners.failedAction"));
      }
    } catch {
      toast.error(t("partners.somethingWentWrong"));
    } finally {
      setIsReviewing(false);
      setReviewModal({ open: false, item: null, action: null });
    }
  };

  const safePartners = Array.isArray(partners) ? partners : [];
  const safeRequests = Array.isArray(partnershipRequests) ? partnershipRequests : [];

  const filteredPartners = (() => {
    if (partnerTab === "all") return safePartners;
    return safePartners.filter((p) => p.approvalStatus === partnerTab.toUpperCase());
  })();

  const partnerTabCounts = {
    all: safePartners.length,
    approved: safePartners.filter((p) => p.approvalStatus === "APPROVED").length,
    pending: safePartners.filter((p) => p.approvalStatus === "PENDING").length,
    rejected: safePartners.filter((p) => p.approvalStatus === "REJECTED").length,
  };

  const requestTabCounts = {
    all: safeRequests.length,
    approved: safeRequests.filter((r) => r.approvalStatus === "APPROVED").length,
    pending: safeRequests.filter((r) => r.approvalStatus === "PENDING").length,
    rejected: safeRequests.filter((r) => r.approvalStatus === "REJECTED").length,
  };

  const partnersTotal = partnersPagination?.total || safePartners.length;
  const partnersTotalPages = partnersPagination?.totalPages || 1;
  const partnersFrom = partnersTotal === 0 ? 0 : (currentPartnersPage - 1) * PAGE_LIMIT + 1;
  const partnersTo = Math.min(currentPartnersPage * PAGE_LIMIT, partnersTotal);

  const requestsTotal = requestsPagination?.total || safeRequests.length;
  const requestsTotalPages = requestsPagination?.totalPages || 1;
  const requestsFrom = requestsTotal === 0 ? 0 : (currentRequestsPage - 1) * PAGE_LIMIT + 1;
  const requestsTo = Math.min(currentRequestsPage * PAGE_LIMIT, requestsTotal);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("partners.title")} description={t("partners.description")}>
        <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("partners.totalPartners")} value={partnersTotal} icon={Handshake} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("partners.approved")} value={partnerTabCounts.approved} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("partners.pendingRequests")} value={requestTabCounts.pending} icon={Clock} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("partners.totalRequests")} value={requestsTotal} icon={FileText} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={cn("flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", mainTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-white dark:bg-[#0f1420]" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              {tab.id === "partners" ? <Handshake className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        {mainTab === "partners" && (
          <div>
            <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
              {PARTNER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPartnerTab(tab.id)}
                  className={cn("flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", partnerTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}
                >
                  {tab.label}
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", partnerTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                    {partnerTabCounts[tab.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("partners.searchPlaceholder")} />
                </div>
                {searchQuery && (
                  <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                    <X className="h-3.5 w-3.5" />{t("partners.clear")}
                  </button>
                )}
                <p className="text-[11px] text-muted-foreground font-medium">
                  {filteredPartners.length} {filteredPartners.length !== 1 ? t("partners.resultsPlural") : t("partners.results")}
                </p>
              </div>
            </div>

            <div className="p-4">
              {isLoading ? (
                <LoadingSpinner size="lg" text={t("partners.loadingPartners")} className="py-16" />
              ) : filteredPartners.length === 0 ? (
                <EmptyState
                  icon={Handshake}
                  title={t("partners.noPartnersFound")}
                  description={searchQuery ? t("partners.tryAdjustingSearch") : t("partners.noPartnersYet")}
                  action={searchQuery ? (
                    <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
                      {t("partners.clearSearch")}
                    </button>
                  ) : null}
                />
              ) : (
                <>
                  <PartnersTable
                    items={filteredPartners}
                    onView={(it) => router.push(`/partners/${it.id}`)}
                    onDelete={(it) => setDeleteDialog({ open: true, item: it })}
                  />
                  <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                    <Pagination currentPage={currentPartnersPage} totalPages={partnersTotalPages} onPageChange={handlePartnersPageChange} from={partnersFrom} to={partnersTo} total={partnersTotal} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {mainTab === "requests" && (
          <div>
            <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
              {REQUEST_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleRequestTabChange(tab.id)}
                  className={cn("flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", requestTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}
                >
                  {tab.label}
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", requestTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                    {requestTabCounts[tab.id] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4">
              {isRequestsLoading ? (
                <LoadingSpinner size="lg" text={t("partners.loadingRequests")} className="py-16" />
              ) : safeRequests.length === 0 ? (
                <EmptyState icon={FileText} title={t("partners.noPartnershipRequests")} description={t("partners.noRequestsYet")} />
              ) : (
                <>
                  <PartnershipRequestsTable
                    items={safeRequests}
                    onView={(it) => setReviewModal({ open: true, item: it, action: "view" })}
                    onApprove={(it) => setReviewModal({ open: true, item: it, action: "approve" })}
                    onReject={(it) => setReviewModal({ open: true, item: it, action: "reject" })}
                  />
                  <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                    <Pagination currentPage={currentRequestsPage} totalPages={requestsTotalPages} onPageChange={handleRequestsPageChange} from={requestsFrom} to={requestsTo} total={requestsTotal} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("partners.deletePartner")}
        description={deleteDialog.item ? `${t("partners.deletePartnerDesc")} "${deleteDialog.item.title}"${t("partners.deletePartnerSuffix")}` : t("partners.areYouSure")}
        confirmLabel={t("partners.delete")}
        isLoading={isDeleting}
        variant="danger"
      />

      <ReviewRequestModal
        open={reviewModal.open}
        item={reviewModal.item}
        action={reviewModal.action}
        onClose={() => setReviewModal({ open: false, item: null, action: null })}
        onSubmit={handleReviewSubmit}
        isLoading={isReviewing}
      />
    </div>
  );
}