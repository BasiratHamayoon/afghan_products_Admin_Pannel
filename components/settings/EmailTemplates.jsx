"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Send, X, Save, Tag } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { emailCategoryOptions } from "@/data/dummySettings";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function TemplateForm({ template, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "user",
    status: "active",
    subject: "",
    body: "",
    variables: [],
    ...template,
  });
  const [varInput, setVarInput] = useState("");

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] cursor-text";
  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

  const addVar = () => {
    const v = varInput.trim().toLowerCase().replace(/\s+/g, "_");
    if (v && !(form.variables || []).includes(v)) setForm((p) => ({ ...p, variables: [...(p.variables || []), v] }));
    setVarInput("");
  };

  const removeVar = (v) => setForm((p) => ({ ...p, variables: (p.variables || []).filter((x) => x !== v) }));

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border border-[#0F69B0]/20 bg-[#0F69B0]/5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Template Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Welcome Email" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
          <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={selectClass}>
            {emailCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className={selectClass}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description..." className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Subject</label>
        <input type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Email subject line..." className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Body (HTML)</label>
        <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={8} placeholder="Email HTML content..." className={cn(inputClass, "resize-none font-mono text-xs")} />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Variables</label>
        <div className="flex gap-2">
          <input type="text" value={varInput} onChange={(e) => setVarInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVar(); } }} placeholder="Add variable name..." className={cn(inputClass, "flex-1")} />
          <button type="button" onClick={addVar} className="px-3 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>Add</button>
        </div>
        {(form.variables || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {form.variables.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">
                {`{{${v}}}`}
                <button type="button" onClick={() => removeVar(v)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
          <X className="h-3.5 w-3.5" />Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={!form.name || !form.subject || isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-3.5 w-3.5" />{isSaving ? "Saving..." : template?.id ? "Update" : "Create"}
        </button>
      </div>
    </motion.div>
  );
}

export default function EmailTemplates({ templates, onSave, onCreate, onDelete, isSaving }) {
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = categoryFilter === "all" ? (templates || []) : (templates || []).filter((t) => t.category === categoryFilter);

  const handleDelete = async () => {
    if (!deleteDialog.item?.id) return;
    setIsDeleting(true);
    const res = await onDelete(deleteDialog.item.id);
    setIsDeleting(false);
    if (res?.success) toast.success("Template deleted");
    else toast.error("Failed to delete template");
    setDeleteDialog({ open: false, item: null });
  };

  const categoryColors = { user: "#0F69B0", order: "#10b981", seller: "#7c3aed", dispute: "#ef4444", payment: "#f59e0b", marketing: "#6366f1" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setCategoryFilter("all")} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer", categoryFilter === "all" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/[0.06]")}>All</button>
          {emailCategoryOptions.map((cat) => (
            <button key={cat.value} onClick={() => setCategoryFilter(cat.value)} className={cn("px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer capitalize", categoryFilter === cat.value ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/[0.06]")}>
              {cat.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Plus className="h-3.5 w-3.5" />New Template
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <TemplateForm
            onSave={async (data) => {
              const res = await onCreate(data);
              if (res?.success) { toast.success("Template created!"); setShowCreate(false); }
              else toast.error("Failed to create template");
            }}
            onCancel={() => setShowCreate(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filtered.map((template, i) => (
          <motion.div key={template.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] shadow-[0_1px_6px_rgba(15,105,176,0.04)]">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${categoryColors[template.category] || "#0F69B0"}15` }}>
                    <Send className="h-4 w-4" style={{ color: categoryColors[template.category] || "#0F69B0" }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm font-black text-foreground">{template.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize" style={{ background: `${categoryColors[template.category] || "#0F69B0"}15`, color: categoryColors[template.category] || "#0F69B0" }}>{template.category}</span>
                      <StatusBadge status={template.status} />
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingId(editingId === template.id ? null : template.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setDeleteDialog({ open: true, item: template })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="ml-12 flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
                <span className="truncate max-w-[280px]">Subject: <span className="font-bold text-foreground">{template.subject}</span></span>
                <span>Last used: <span className="font-bold text-foreground">{template.lastUsed ? formatDate(template.lastUsed) : "Never"}</span></span>
                {(template.variables || []).length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Tag className="h-3 w-3" />
                    {template.variables.slice(0, 3).map((v) => (
                      <span key={v} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-[9px] font-bold">{`{{${v}}}`}</span>
                    ))}
                    {template.variables.length > 3 && <span className="text-[9px] font-bold">+{template.variables.length - 3} more</span>}
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>
              {editingId === template.id && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] p-4">
                  <TemplateForm
                    template={template}
                    onSave={async (data) => {
                      const res = await onSave(template.id, data);
                      if (res?.success) { toast.success("Template updated!"); setEditingId(null); }
                      else toast.error("Failed to update template");
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

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete} title="Delete Template" description={`Are you sure you want to delete "${deleteDialog.item?.name}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}