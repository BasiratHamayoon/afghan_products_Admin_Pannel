"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, CheckCircle,
  XCircle, Star, LayoutDashboard, Ban,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import TradeLeadDetails from "@/components/trade-leads/TradeLeadDetails";
import TradeLeadForm from "@/components/trade-leads/TradeLeadForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import {
  fetchTradeLeadById, removeTradeLead, editTradeLead,
  approveTradeLead, closeTradeLead,
} from "@/store/actions/tradeLeadsActions";
import { tradeLeadTypeConfig } from "@/data/dummyTradeLeads";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "edit", label: "Edit Lead", icon: Edit2 },
];

export default function TradeLeadDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { selectedLead: lead, isLoading } = useSelector((state) => state.tradeLeads);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchTradeLeadById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (searchParams.get("tab") === "edit") setActiveTab("edit");
  }, [searchParams]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editTradeLead(id, data));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Lead updated!");
      setActiveTab("overview");
      router.replace(`/trade-leads/${id}`);
    } else {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeTradeLead(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Lead deleted");
      router.push("/trade-leads");
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    const res = await dispatch(approveTradeLead(id));
    if (res?.success) toast.success("Lead approved");
    else toast.error("Failed to approve");
  };

  const handleClose = async () => {
    if (!id) return;
    const res = await dispatch(closeTradeLead(id));
    if (res?.success) toast.success("Lead closed");
    else toast.error("Failed to close");
  };

  const handleToggleFeatured = async () => {
    if (!lead?.id) return;
    await dispatch(editTradeLead(lead.id, { ...lead, featured: !lead.featured }));
    toast.success(`${!lead.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading lead..." />
      </div>
    );
  }

  if (!lead || !lead.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground mb-1">Trade Lead not found</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm">
            The trade lead does not exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => router.push("/trade-leads")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Trade Leads
        </button>
      </div>
    );
  }

  const typeConfig = tradeLeadTypeConfig[lead.type] || tradeLeadTypeConfig.buy;
  const isPending = lead.status === "pending";
  const isActive = lead.status === "active";

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title={lead.title || "Trade Lead Detail"}
        description={`${typeConfig.label} · ${lead.category || "Uncategorized"} · ${lead.user?.name || ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => router.push("/trade-leads")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            onClick={handleToggleFeatured}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer",
              lead.featured
                ? "border-yellow-200 dark:border-yellow-800/40 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            )}
          >
            <Star className={cn("h-4 w-4", lead.featured && "fill-yellow-400 text-yellow-400")} />
            <span className="hidden sm:inline">{lead.featured ? "Unfeature" : "Feature"}</span>
          </button>

          {isPending && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-green-200 dark:border-green-800/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Approve</span>
            </button>
          )}

          {isActive && (
            <button
              onClick={handleClose}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <Ban className="h-4 w-4" />
              <span className="hidden sm:inline">Close Lead</span>
            </button>
          )}

          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("edit");
              router.replace(`/trade-leads/${id}?tab=edit`);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-1 p-3 sm:p-4 border-b border-gray-50 dark:border-white/[0.04] overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 mr-4 shrink-0">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: typeConfig.bg }}
            >
              {typeConfig.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {lead.title}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <StatusBadge status={lead.status} />
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: typeConfig.bg, color: typeConfig.text }}
                >
                  {typeConfig.label}
                </span>
              </div>
            </div>
          </div>

          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  router.replace(
                    tab.id === "edit"
                      ? `/trade-leads/${id}?tab=edit`
                      : `/trade-leads/${id}`
                  );
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TradeLeadDetails lead={lead} />
              </motion.div>
            )}

            {activeTab === "edit" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <TradeLeadForm
                  initialData={lead}
                  onSubmit={handleUpdate}
                  onCancel={() => {
                    setActiveTab("overview");
                    router.replace(`/trade-leads/${id}`);
                  }}
                  isLoading={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Trade Lead"
        description={`Are you sure you want to delete "${lead.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}