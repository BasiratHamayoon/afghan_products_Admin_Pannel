"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, AlertTriangle, XCircle,
  FileText, Clock, MessageSquare,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import DisputeDetails from "@/components/disputes/DisputeDetails";
import DisputeTimeline from "@/components/disputes/DisputeTimeline";
import DisputeActions from "@/components/disputes/DisputeActions";
import StatusBadge from "@/components/common/StatusBadge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  fetchDisputeById, resolveDispute, escalateDispute,
  sendDisputeMessage, assignDispute, updateDisputeStatus,
} from "@/store/actions/disputesActions";
import { disputeTypeOptions, disputePriorityOptions } from "@/data/dummyDisputes";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Details", "Timeline", "Actions"];

export default function DisputeDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedDispute: dispute, isLoading } = useSelector((s) => s.disputes);
  const [activeTab, setActiveTab] = useState("Details");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { if (id) dispatch(fetchDisputeById(id)); }, [dispatch, id]);

  const handleResolve = async (resolution, refundAmount) => {
    setActionLoading(true);
    const res = await dispatch(resolveDispute(id, resolution, refundAmount));
    setActionLoading(false);
    if (res?.success) { toast.success("Dispute resolved successfully!"); setActiveTab("Details"); }
    else toast.error("Failed to resolve dispute");
  };

  const handleEscalate = async (reason) => {
    setActionLoading(true);
    const res = await dispatch(escalateDispute(id, reason));
    setActionLoading(false);
    if (res?.success) { toast.success("Dispute escalated!"); setActiveTab("Timeline"); }
    else toast.error("Failed to escalate dispute");
  };

  const handleClose = async () => {
    setActionLoading(true);
    const res = await dispatch(updateDisputeStatus(id, "closed", "Dispute closed by admin"));
    setActionLoading(false);
    if (res?.success) toast.success("Dispute closed");
    else toast.error("Failed to close dispute");
  };

  const handleAssign = async (adminName) => {
    setActionLoading(true);
    const res = await dispatch(assignDispute(id, adminName));
    setActionLoading(false);
    if (res?.success) toast.success(`Assigned to ${adminName}`);
    else toast.error("Failed to assign dispute");
  };

  const handleSendMessage = async (content) => {
    const res = await dispatch(sendDisputeMessage(id, content));
    if (res?.success) toast.success("Message sent");
    else toast.error("Failed to send message");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dispute..." />
      </div>
    );
  }

  if (!dispute || !dispute.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Dispute not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The dispute does not exist or has been deleted.</p>
        <button onClick={() => router.push("/disputes")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Disputes
        </button>
      </div>
    );
  }

  const typeOpt = disputeTypeOptions.find((t) => t.value === dispute.type);
  const priorityOpt = disputePriorityOptions.find((p) => p.value === dispute.priority);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={dispute.title || "Dispute Detail"} description={`Order: ${dispute.orderId} · $${dispute.amount?.toLocaleString()}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/disputes")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <StatusBadge status={dispute.status} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-3" style={{ background: "rgba(239,68,68,0.1)" }}>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-sm font-black text-foreground mb-1 line-clamp-2">{dispute.title}</h3>
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${typeOpt?.color}15`, color: typeOpt?.color }}>{typeOpt?.label}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${priorityOpt?.color}15`, color: priorityOpt?.color }}>● {priorityOpt?.label}</span>
          </div>
          <p className="text-xs font-black text-foreground mt-3">${dispute.amount?.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{dispute.currency}</p>
        </motion.div>

        {[
          { label: "Buyer", value: dispute.buyer?.name, sub: dispute.buyer?.email, color: "#0F69B0", bg: "rgba(15,105,176,0.08)" },
          { label: "Seller", value: dispute.seller?.name, sub: dispute.seller?.email, color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
          { label: "Assigned To", value: dispute.assignedTo?.name || "Unassigned", sub: dispute.status, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between"
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: item.bg }}>
              <div className="h-4 w-4 rounded-full" style={{ background: item.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-black text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5 capitalize">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => {
            const icons = { Details: FileText, Timeline: Clock, Actions: AlertTriangle };
            const Icon = icons[tab];
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeTab === tab
                    ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab}
                {tab === "Timeline" && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab ? "bg-white/20" : "bg-gray-100 dark:bg-white/[0.08]")}>
                    {(dispute.timeline || []).length}
                  </span>
                )}
                {tab === "Details" && (
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab ? "bg-white/20" : "bg-gray-100 dark:bg-white/[0.08]")}>
                    {(dispute.messages || []).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <DisputeDetails dispute={dispute} onSendMessage={handleSendMessage} />
              </motion.div>
            )}
            {activeTab === "Timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <DisputeTimeline timeline={dispute.timeline} />
              </motion.div>
            )}
            {activeTab === "Actions" && (
              <motion.div key="actions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <DisputeActions
                  dispute={dispute}
                  onResolve={handleResolve}
                  onEscalate={handleEscalate}
                  onClose={handleClose}
                  onAssign={handleAssign}
                  isLoading={actionLoading}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}