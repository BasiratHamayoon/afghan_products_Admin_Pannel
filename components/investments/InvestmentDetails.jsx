// components/investments/InvestmentDetails.jsx

"use client";

import { motion } from "framer-motion";
import {
  Hash, MapPin, Calendar, DollarSign, TrendingUp,
  Users, Target, Clock, FileText, CheckCircle,
  AlertCircle, XCircle, Loader,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/helpers";
import { investmentTypeOptions, riskLevelOptions } from "@/data/dummyInvestments";

function getTypeInfo(type) {
  return investmentTypeOptions.find((t) => t.value === type) || { icon: "📦", label: type, color: "#6b7280" };
}

function getRiskInfo(level) {
  return riskLevelOptions.find((r) => r.value === level) || { label: level, color: "#6b7280" };
}

function ProgressBar({ current, target, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black text-foreground">${(current).toLocaleString()}</span>
        <span className="text-xs font-bold text-muted-foreground">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color || "#0F69B0" }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground font-medium mt-1.5">
        Target: ${(target).toLocaleString()}
      </p>
    </div>
  );
}

function MilestoneStatus({ status }) {
  const config = {
    completed: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Completed" },
    "in-progress": { icon: Loader, color: "#0F69B0", bg: "rgba(15,105,176,0.1)", label: "In Progress" },
    pending: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Pending" },
    cancelled: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Cancelled" },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export default function InvestmentDetails({ investment }) {
  if (!investment) return null;

  const inv = investment;
  const typeInfo = getTypeInfo(inv.type);
  const riskInfo = getRiskInfo(inv.riskLevel);

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Funding Progress</h4>
        <ProgressBar current={inv.investedAmount} target={inv.targetAmount} color={typeInfo.color} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Investment ID", value: inv.id, icon: Hash },
          { label: "Type", value: (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: typeInfo.color }}>
              <span>{typeInfo.icon}</span> {typeInfo.label}
            </span>
          ), icon: null },
          { label: "Status", value: <StatusBadge status={inv.status} />, icon: null },
          { label: "Priority", value: (
            <span className={`text-sm font-bold capitalize ${inv.priority === "high" ? "text-red-500" : inv.priority === "medium" ? "text-yellow-500" : "text-green-500"}`}>
              {inv.priority}
            </span>
          ), icon: AlertCircle },
          { label: "Location", value: inv.location, icon: MapPin },
          { label: "Category", value: inv.category, icon: null },
          { label: "Risk Level", value: (
            <span className="text-sm font-bold" style={{ color: riskInfo.color }}>{riskInfo.label}</span>
          ), icon: null },
          { label: "Expected ROI", value: `${inv.roi}%`, icon: TrendingUp },
          { label: "Duration", value: `${inv.duration} ${inv.durationUnit}`, icon: Clock },
          { label: "Total Investors", value: inv.investorsCount, icon: Users },
          { label: "Min Investment", value: `$${(inv.minInvestment || 0).toLocaleString()}`, icon: DollarSign },
          { label: "Max Investment", value: `$${(inv.maxInvestment || 0).toLocaleString()}`, icon: DollarSign },
          { label: "Total Returns", value: `$${(inv.returnAmount || 0).toLocaleString()}`, icon: DollarSign },
          { label: "Currency", value: inv.currency, icon: DollarSign },
          { label: "Start Date", value: formatDate(inv.startDate) || "Not set", icon: Calendar },
          { label: "End Date", value: formatDate(inv.endDate) || "Not set", icon: Calendar },
          { label: "Created At", value: formatDateTime(inv.createdAt), icon: Calendar },
          { label: "Updated At", value: formatDateTime(inv.updatedAt), icon: Calendar },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
          >
            {item.icon && (
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                <item.icon className="h-4 w-4 text-[#0F69B0]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <div className="text-sm font-bold text-foreground break-all">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {inv.tags && inv.tags.length > 0 && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {inv.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {inv.investor && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Lead Investor</h4>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center text-sm font-black text-[#0F69B0]">
              {inv.investor.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{inv.investor.name}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{inv.investor.email}</p>
              {inv.investor.phone && <p className="text-[11px] text-muted-foreground font-medium">{inv.investor.phone}</p>}
            </div>
          </div>
        </div>
      )}

      {inv.manager && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Project Manager</h4>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-sm font-black text-purple-500">
              {inv.manager.name?.charAt(0) || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{inv.manager.name}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{inv.manager.email}</p>
            </div>
          </div>
        </div>
      )}

      {inv.milestones && inv.milestones.length > 0 && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Milestones</h4>
          <div className="space-y-3">
            {inv.milestones.map((ms, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-xs font-black text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{ms.title}</p>
                  {ms.date && <p className="text-[10px] text-muted-foreground font-medium">{formatDate(ms.date)}</p>}
                </div>
                <MilestoneStatus status={ms.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {inv.returns && inv.returns.length > 0 && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Return History</h4>
          <div className="space-y-2">
            {inv.returns.map((ret, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
                <div>
                  <p className="text-sm font-bold text-foreground">{ret.period}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-foreground">${ret.amount.toLocaleString()}</span>
                  <StatusBadge status={ret.status === "paid" ? "active" : "pending"} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inv.documents && inv.documents.length > 0 && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Documents</h4>
          <div className="space-y-2">
            {inv.documents.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
                <div className="h-9 w-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{doc.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{doc.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}