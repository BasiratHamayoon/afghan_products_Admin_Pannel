"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, CheckCircle, ToggleLeft, ToggleRight, Shield, Star, X, Save } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function GatewayForm({ gateway, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "💳",
    status: "active",
    isDefault: false,
    testMode: false,
    transactionFee: 0,
    fixedFee: 0,
    credentials: {},
    supportedCurrencies: ["USD"],
    ...gateway,
  });

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] cursor-text";
  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border border-[#0F69B0]/20 bg-[#0F69B0]/5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Gateway Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Stripe" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Icon (Emoji)</label>
          <input type="text" value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} placeholder="💳" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Transaction Fee (%)</label>
          <input type="number" value={form.transactionFee} onChange={(e) => setForm((p) => ({ ...p, transactionFee: Number(e.target.value) }))} min={0} step={0.1} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Fixed Fee ($)</label>
          <input type="number" value={form.fixedFee} onChange={(e) => setForm((p) => ({ ...p, fixedFee: Number(e.target.value) }))} min={0} step={0.01} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={selectClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
        <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Gateway description..." className={cn(inputClass, "resize-none")} />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
          <X className="h-3.5 w-3.5" />Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={!form.name || isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-3.5 w-3.5" />{isSaving ? "Saving..." : gateway?.id ? "Update" : "Create"}
        </button>
      </div>
    </motion.div>
  );
}

export default function PaymentGateways({ gateways, onSave, onCreate, onDelete, isSaving }) {
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDialog.item?.id) return;
    setIsDeleting(true);
    const res = await onDelete(deleteDialog.item.id);
    setIsDeleting(false);
    if (res?.success) toast.success("Gateway deleted");
    else toast.error("Failed to delete gateway");
    setDeleteDialog({ open: false, item: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground font-medium">{(gateways || []).length} payment gateways configured</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Plus className="h-3.5 w-3.5" />Add Gateway
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <GatewayForm
            onSave={async (data) => {
              const res = await onCreate(data);
              if (res?.success) { toast.success("Gateway created!"); setShowCreate(false); }
              else toast.error("Failed to create gateway");
            }}
            onCancel={() => setShowCreate(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {(gateways || []).map((gateway, i) => (
          <motion.div key={gateway.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] shadow-[0_1px_6px_rgba(15,105,176,0.04)]">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                  {gateway.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-foreground">{gateway.name}</h3>
                      {gateway.isDefault && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"><Star className="h-2.5 w-2.5" />Default</span>}
                      {gateway.testMode && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600">Test Mode</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={gateway.status} />
                      <button onClick={() => setEditingId(editingId === gateway.id ? null : gateway.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {!gateway.isDefault && (
                        <button onClick={() => setDeleteDialog({ open: true, item: gateway })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mb-2">{gateway.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
                    <span>Fee: <span className="font-bold text-foreground">{gateway.transactionFee}% + ${gateway.fixedFee}</span></span>
                    <span>Currencies: <span className="font-bold text-foreground">{(gateway.supportedCurrencies || []).join(", ")}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {editingId === gateway.id && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] p-4">
                  <GatewayForm
                    gateway={gateway}
                    onSave={async (data) => {
                      const res = await onSave(gateway.id, data);
                      if (res?.success) { toast.success("Gateway updated!"); setEditingId(null); }
                      else toast.error("Failed to update gateway");
                    }}
                    onCancel={() => setEditingId(null)}
                    isSaving={isSaving}
                  />
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete} title="Delete Payment Gateway" description={`Are you sure you want to delete "${deleteDialog.item?.name}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}