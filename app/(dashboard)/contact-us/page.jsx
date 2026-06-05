"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageCircle, X, Mail, RefreshCw, CheckCircle,
  Eye, EyeOff, Calendar, Phone, User,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ContactMessagesTable from "@/components/contact-us/ContactMessagesTable";
import SearchInput from "@/components/common/SearchInput";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import { fetchContactMessages } from "@/store/actions/contactUsActions";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Messages" },
  { id: "UNREAD", label: "Unread" },
  { id: "READ", label: "Read" },
  { id: "REPLIED", label: "Replied" },
];

const statusConfig = {
  UNREAD: { label: "Unread", bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  READ: { label: "Read", bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  REPLIED: { label: "Replied", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

function MessageDetailModal({ message, onClose }) {
  if (!message) return null;
  const status = statusConfig[message.status] || statusConfig.UNREAD;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-2xl overflow-hidden">
        <div
          className="h-16 w-full relative"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <div className="absolute inset-0">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 h-8 w-8 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-white/80" />
            <span className="text-xs font-bold text-white">Message Detail</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                {message.name ? message.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">{message.name || "—"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="h-3 w-3 text-muted-foreground/50" />
                  <p className="text-[11px] text-muted-foreground font-medium">{message.email || "—"}</p>
                </div>
                {message.phone && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 text-muted-foreground/50" />
                    <p className="text-[11px] text-muted-foreground font-medium">{message.phone}</p>
                  </div>
                )}
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0", status.bg, status.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </div>

          {message.subject && (
            <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Subject</p>
              <p className="text-sm font-bold text-foreground">{message.subject}</p>
            </div>
          )}

          <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Message</p>
            <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
              {message.message || "—"}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(message.createdAt)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactUsPage() {
  const dispatch = useDispatch();
  const { messages, isLoading, pagination } = useSelector((state) => state.contactUs);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const searchDebounceRef = useRef(null);
  const hasFetched = useRef(false);

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search && search.trim()) params.search = search.trim();
    if (tab !== "all") params.status = tab;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchContactMessages(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

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
    setSelectedMessage(msg);
  }, []);

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
  };

  return (
    <>
      <div className="space-y-5">
        <Breadcrumb />
        <PageHeader
          title="Contact Messages"
          description="View and manage all contact form submissions"
        />

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
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                    activeTab === tab.id
                      ? "bg-[#0F69B0] text-white"
                      : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                  )}
                >
                  {tabCounts[tab.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <SearchInput
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by name, email, subject..."
                />
              </div>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
                >
                  <X className="h-3.5 w-3.5" />Clear
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
                title="Refresh"
              >
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
                description={searchQuery ? "Try adjusting your search" : "No contact messages yet"}
                action={
                  searchQuery ? (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  ) : null
                }
              />
            ) : (
              <>
                <ContactMessagesTable messages={safeMessages} onView={handleView} />
                <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    from={from}
                    to={to}
                    total={total}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </>
  );
}