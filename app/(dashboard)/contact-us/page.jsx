"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  MessageCircle, X, Mail, RefreshCw,
  CheckCircle, Eye, Archive,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ContactMessagesTable from "@/components/contact-us/ContactMessagesTable";
import SearchInput from "@/components/common/SearchInput";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchContactMessages,
  archiveContactMessageAction,
  unarchiveContactMessageAction,
} from "@/store/actions/contactUsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Messages" },
  { id: "UNREAD", label: "Unread" },
  { id: "READ", label: "Read" },
  { id: "REPLIED", label: "Replied" },
  { id: "archived", label: "Archived" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function ContactUsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { messages, isLoading, pagination } = useSelector((state) => state.contactUs);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialog, setArchiveDialog] = useState({ open: false, item: null, action: null });
  const [isActioning, setIsActioning] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetched = useRef(false);

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "archived") {
      params.isArchived = true;
    } else if (tab !== "all") {
      params.status = tab;
    }
    return params;
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchContactMessages(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchContactMessages(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab);
  }, [triggerFetch]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab);
    }, DEBOUNCE_DELAY);
  }, [activeTab, triggerFetch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab);
  }, [searchQuery, activeTab, triggerFetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab);
  }, [activeTab, triggerFetch]);

  const handleRefresh = useCallback(() => {
    triggerFetch(currentPage, searchQuery, activeTab);
  }, [currentPage, searchQuery, activeTab, triggerFetch]);

  const handleView = useCallback((msg) => {
    router.push(`/contact-us/${msg.id}`);
  }, [router]);

  const handleReply = useCallback((msg) => {
    router.push(`/contact-us/reply?id=${msg.id}`);
  }, [router]);

  const handleArchiveConfirm = useCallback(async () => {
    const { item, action } = archiveDialog;
    if (!item?.id) {
      setArchiveDialog({ open: false, item: null, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn = action === "archive" ? archiveContactMessageAction : unarchiveContactMessageAction;
      const res = await dispatch(fn(item.id));
      if (res?.success) {
        toast.success(action === "archive" ? "Message archived" : "Message unarchived");
        triggerFetch(currentPage, searchQuery, activeTab);
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, item: null, action: null });
    }
  }, [archiveDialog, dispatch, triggerFetch, currentPage, searchQuery, activeTab]);

  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];
  const total = pagination?.total || safeMessages.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeMessages.length,
    UNREAD: safeMessages.filter((m) => m.status === "UNREAD").length,
    READ: safeMessages.filter((m) => m.status === "READ").length,
    REPLIED: safeMessages.filter((m) => m.status === "REPLIED").length,
    archived: safeMessages.filter((m) => m.isArchived).length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Contact Messages" description="View and manage all contact form submissions" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Messages" value={total} icon={MessageCircle} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Unread" value={tabCounts.UNREAD} icon={Mail} color="rgba(59,130,246,0.08)" index={1} />
        <StatsCard title="Read" value={tabCounts.READ} icon={Eye} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Replied" value={tabCounts.REPLIED} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => (
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
              {tab.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Search by name, email, subject..." />
            </div>
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />Clear
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeMessages.length} result{safeMessages.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading messages..." className="py-16" />
          ) : safeMessages.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No messages found"
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : activeTab === "archived"
                  ? "No archived messages"
                  : activeTab === "UNREAD"
                  ? "No unread messages"
                  : "No contact messages yet"
              }
              action={
                searchQuery ? (
                  <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                    Clear Search
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <ContactMessagesTable
                messages={safeMessages}
                onView={handleView}
                onReply={handleReply}
                onArchive={(msg) => setArchiveDialog({ open: true, item: msg, action: "archive" })}
                onUnarchive={(msg) => setArchiveDialog({ open: true, item: msg, action: "unarchive" })}
              />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, item: null, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? "Archive Message" : "Unarchive Message"}
        description={archiveDialog.item ? `Are you sure you want to ${archiveDialog.action} the message from "${archiveDialog.item.name}"?` : "Are you sure?"}
        confirmLabel={archiveDialog.action === "archive" ? "Archive" : "Unarchive"}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />
    </div>
  );
}