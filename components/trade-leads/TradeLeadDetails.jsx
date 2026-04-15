"use client";

import { motion } from "framer-motion";
import { Eye, MessageSquare, Calendar, Clock, MapPin, Tag, DollarSign, Package, User, CheckCircle, Star, Truck, FileText, AlertTriangle } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDateTime, formatDate } from "@/lib/helpers";
import { tradeLeadTypeConfig, tradeLeadStatusConfig } from "@/data/dummyTradeLeads";
import ImagePreview from "@/components/common/ImagePreview";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: { label: "High", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  medium: { label: "Medium", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  low: { label: "Low", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function TradeLeadDetails({ lead }) {
  if (!lead) return null;
  const typeConfig = tradeLeadTypeConfig[lead.type] || tradeLeadTypeConfig.buy;
  const statusCfg = tradeLeadStatusConfig[lead.status] || tradeLeadStatusConfig.active;
  const pCfg = priorityConfig[lead.priority] || priorityConfig.medium;
  const isExpired = new Date(lead.expiresAt) < new Date();

  const stats = [
    { label: "Views", value: lead.views || 0, icon: Eye, color: "#0F69B0", bg: "rgba(15,105,176,0.1)" },
    { label: "Responses", value: lead.responses || 0, icon: MessageSquare, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Budget", value: lead.budget || 0, icon: DollarSign, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", isCurrency: true },
    { label: "Reports", value: lead.reportCount || 0, icon: AlertTriangle, color: lead.reportCount > 0 ? "#ef4444" : "#6b7280", bg: lead.reportCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(107,114,128,0.1)" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-foreground">
              {stat.isCurrency ? formatCurrency(stat.value) : <AnimatedCounter value={stat.value} duration={1000} />}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 space-y-4">
          {lead.images?.length > 0 && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
              <ImagePreview images={lead.images} />
            </div>
          )}

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <span className="text-lg">{typeConfig.icon}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: typeConfig.bg, color: typeConfig.text }}>{typeConfig.label}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: statusCfg.bg, color: statusCfg.text }}>{statusCfg.label}</span>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: pCfg.bg, color: pCfg.text }}>{pCfg.label} Priority</span>
              {lead.featured && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">★ Featured</span>}
              {isExpired && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">Expired</span>}
            </div>
            <h2 className="text-lg font-black text-foreground leading-tight mb-3">{lead.title}</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4">{lead.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {[
                { label: "Category", value: `${lead.category}${lead.subCategory ? ` > ${lead.subCategory}` : ""}`, icon: Tag },
                { label: "Quantity", value: lead.quantity, icon: Package },
                { label: "Budget Range", value: lead.budgetMin && lead.budgetMax ? `${formatCurrency(lead.budgetMin)} – ${formatCurrency(lead.budgetMax)}` : formatCurrency(lead.budget), icon: DollarSign },
                { label: "Delivery Location", value: lead.deliveryLocation, icon: MapPin },
                { label: "Delivery Timeline", value: lead.deliveryTimeline, icon: Truck },
                { label: "Payment Terms", value: lead.paymentTerms, icon: FileText },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/8 flex items-center justify-center shrink-0">
                    <item.icon className="h-3.5 w-3.5 text-[#0F69B0]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-bold text-foreground">{item.value || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>

            {lead.requirements?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Requirements</p>
                <div className="space-y-1.5">
                  {lead.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                      <CheckCircle className="h-3.5 w-3.5 text-[#0F69B0] mt-0.5 shrink-0" />
                      <p className="text-xs font-medium text-foreground">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lead.tags?.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0F69B0]/8 text-[#0F69B0]">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-4">
          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Posted By</h3>
            <div className="flex items-center gap-3 mb-4">
              {lead.user?.avatar ? (
                <img src={lead.user.avatar} alt={lead.user.name} className="h-12 w-12 rounded-2xl object-cover border border-gray-100 dark:border-white/[0.08]" />
              ) : (
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black text-white" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  {getInitials(lead.user?.name || "?")}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-foreground">{lead.user?.name}</p>
                  {lead.user?.verified && <CheckCircle className="h-3.5 w-3.5 text-[#0F69B0] fill-[#0F69B0]/20" />}
                </div>
                <p className="text-[11px] text-muted-foreground font-medium">{lead.user?.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-muted-foreground/50" />
                  <p className="text-[11px] text-muted-foreground font-medium">{lead.user?.city}, {lead.user?.country}</p>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: lead.user?.role === "seller" ? "rgba(15,105,176,0.1)" : "rgba(124,58,237,0.1)", color: lead.user?.role === "seller" ? "#0F69B0" : "#7c3aed" }}>
              {lead.user?.role}
            </span>
          </div>

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Timeline</h3>
            <div className="space-y-3">
              {[
                { label: "Created", value: formatDateTime(lead.createdAt), icon: Calendar },
                { label: "Updated", value: formatDateTime(lead.updatedAt), icon: Clock },
                { label: "Expires", value: formatDateTime(lead.expiresAt), icon: Clock, expired: isExpired },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <item.icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", item.expired ? "text-red-500" : "text-muted-foreground/50")} />
                  <div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.label}</p>
                    <p className={cn("text-[11px] font-medium", item.expired ? "text-red-500" : "text-foreground")}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Quick Info</h3>
            <div className="space-y-2">
              {[
                { label: "Lead ID", value: lead.id },
                { label: "Type", value: typeConfig.label },
                { label: "Status", value: statusCfg.label },
                { label: "Priority", value: pCfg.label },
                { label: "Currency", value: lead.currency },
                { label: "Featured", value: lead.featured ? "Yes ⭐" : "No" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}