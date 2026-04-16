"use client";

import { motion } from "framer-motion";
import { FileText, Image, ExternalLink, MessageSquare, Send } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/helpers";
import { disputeTypeOptions, disputePriorityOptions } from "@/data/dummyDisputes";
import { cn } from "@/lib/utils";
import { useState } from "react";

const roleColors = {
  buyer: { bg: "rgba(15,105,176,0.08)", border: "rgba(15,105,176,0.15)", label: "#0F69B0" },
  seller: { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.15)", label: "#7c3aed" },
  admin: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)", label: "#10b981" },
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
        <div className="text-sm font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

export default function DisputeDetails({ dispute, onSendMessage }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!dispute) return null;

  const typeOpt = disputeTypeOptions.find((t) => t.value === dispute.type);
  const priorityOpt = disputePriorityOptions.find((p) => p.value === dispute.priority);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    await onSendMessage?.(message.trim());
    setMessage("");
    setIsSending(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoRow label="Dispute ID" value={dispute.id} />
        <InfoRow label="Order ID" value={dispute.orderId} />
        <InfoRow
          label="Type"
          value={<span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: `${typeOpt?.color}15`, color: typeOpt?.color }}>{typeOpt?.label || dispute.type}</span>}
        />
        <InfoRow
          label="Priority"
          value={<span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: `${priorityOpt?.color}15`, color: priorityOpt?.color }}>● {priorityOpt?.label || dispute.priority}</span>}
        />
        <InfoRow label="Status" value={<StatusBadge status={dispute.status} />} />
        <InfoRow label="Amount" value={`$${dispute.amount?.toLocaleString()} ${dispute.currency}`} />
        <InfoRow label="Created" value={formatDateTime(dispute.createdAt)} />
        <InfoRow label="Last Updated" value={formatDateTime(dispute.updatedAt)} />
        {dispute.resolvedAt && <InfoRow label="Resolved At" value={formatDateTime(dispute.resolvedAt)} />}
        {dispute.refundAmount && <InfoRow label="Refund Amount" value={`$${dispute.refundAmount?.toLocaleString()}`} />}
        <InfoRow label="Assigned To" value={dispute.assignedTo?.name || "Unassigned"} />
      </div>

      <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
        <p className="text-sm font-medium text-foreground leading-relaxed">{dispute.description}</p>
      </div>

      {dispute.resolution && (
        <div className="p-4 rounded-xl border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2">Resolution</p>
          <p className="text-sm font-medium text-foreground leading-relaxed">{dispute.resolution}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Buyer</p>
          <p className="text-sm font-black text-foreground">{dispute.buyer?.name}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{dispute.buyer?.email}</p>
        </div>
        <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Seller</p>
          <p className="text-sm font-black text-foreground">{dispute.seller?.name}</p>
          <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{dispute.seller?.email}</p>
        </div>
      </div>

      {(dispute.evidence || []).length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Evidence</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dispute.evidence.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-colors">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                  {ev.type === "image" ? <Image className="h-4 w-4 text-[#0F69B0]" /> : <FileText className="h-4 w-4 text-[#0F69B0]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{ev.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium capitalize">{ev.uploadedBy} · {formatDate(ev.uploadedAt)}</p>
                </div>
                <a href={ev.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-[#0F69B0] transition-colors">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {(dispute.tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dispute.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">#{tag}</span>
          ))}
        </div>
      )}

      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" /> Messages ({(dispute.messages || []).length})
        </p>
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {(dispute.messages || []).map((msg) => {
            const colors = roleColors[msg.role] || roleColors.admin;
            return (
              <div key={msg.id} className="p-3 rounded-xl border" style={{ background: colors.bg, borderColor: colors.border }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-black" style={{ color: colors.label }}>{msg.sender}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{formatDateTime(msg.timestamp)}</span>
                </div>
                <p className="text-xs font-medium text-foreground leading-relaxed">{msg.content}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}