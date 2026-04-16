"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Shield, Users, X, Save, Check } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { permissionModules, allPermissionActions } from "@/data/dummySettings";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

function RoleForm({ role, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#0F69B0",
    permissions: {},
    ...role,
  });

  const togglePermission = (module, action) => {
    const current = form.permissions?.[module] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setForm((p) => ({ ...p, permissions: { ...p.permissions, [module]: updated } }));
  };

  const toggleAllModule = (module) => {
    const current = form.permissions?.[module] || [];
    const moduleActions = allPermissionActions.filter((a) => getModuleActions(module).includes(a));
    const allSelected = moduleActions.every((a) => current.includes(a));
    setForm((p) => ({ ...p, permissions: { ...p.permissions, [module]: allSelected ? [] : moduleActions } }));
  };

  const getModuleActions = (module) => {
    const base = ["view"];
    const extended = { users: ["view", "create", "edit", "delete"], sellers: ["view", "create", "edit", "delete", "verify"], products: ["view", "create", "edit", "delete", "approve"], orders: ["view", "edit", "cancel", "refund"], disputes: ["view", "resolve", "escalate", "close"], payments: ["view", "refund", "withdraw"], content: ["view", "create", "edit", "delete", "publish"], settings: ["view", "edit"], reports: ["view", "export"], logs: ["view"] };
    return extended[module] || base;
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] cursor-text";
  const colorOptions = ["#0F69B0", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899", "#6b7280"];

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl border border-[#0F69B0]/20 bg-[#0F69B0]/5 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Role Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Support Agent" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {colorOptions.map((clr) => (
              <button key={clr} type="button" onClick={() => setForm((p) => ({ ...p, color: clr }))} className={cn("h-8 w-8 rounded-xl transition-all cursor-pointer border-2", form.color === clr ? "scale-125 border-white shadow-lg" : "border-transparent")} style={{ backgroundColor: clr }} />
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
          <input type="text" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Role description..." className={inputClass} />
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">Permissions</p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {permissionModules.map((mod) => {
            const actions = getModuleActions(mod.key);
            const current = form.permissions?.[mod.key] || [];
            const allSelected = actions.every((a) => current.includes(a));
            return (
              <div key={mod.key} className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-foreground">{mod.label}</p>
                  <button type="button" onClick={() => toggleAllModule(mod.key)} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-lg cursor-pointer transition-colors", allSelected ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.06] text-muted-foreground hover:bg-[#0F69B0]/10 hover:text-[#0F69B0]")}>
                    {allSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {actions.map((action) => {
                    const active = current.includes(action);
                    return (
                      <button key={action} type="button" onClick={() => togglePermission(mod.key, action)} className={cn("flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-all capitalize", active ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.06] text-muted-foreground hover:bg-[#0F69B0]/10 hover:text-[#0F69B0]")}>
                        {active && <Check className="h-2.5 w-2.5" />}
                        {action}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
          <X className="h-3.5 w-3.5" />Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={!form.name || isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-50" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-3.5 w-3.5" />{isSaving ? "Saving..." : role?.id ? "Update Role" : "Create Role"}
        </button>
      </div>
    </motion.div>
  );
}

export default function RolesPermissions({ roles, onSave, onCreate, onDelete, isSaving }) {
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDialog.item?.id) return;
    setIsDeleting(true);
    const res = await onDelete(deleteDialog.item.id);
    setIsDeleting(false);
    if (res?.success) toast.success("Role deleted");
    else toast.error("Failed to delete role");
    setDeleteDialog({ open: false, item: null });
  };

  const getTotalPermissions = (permissions) => Object.values(permissions || {}).reduce((acc, acts) => acc + (acts?.length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-medium">{(roles || []).length} roles configured</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Plus className="h-3.5 w-3.5" />New Role
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <RoleForm
            onSave={async (data) => {
              const res = await onCreate(data);
              if (res?.success) { toast.success("Role created!"); setShowCreate(false); }
              else toast.error("Failed to create role");
            }}
            onCancel={() => setShowCreate(false)}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {(roles || []).map((role, i) => (
          <motion.div key={role.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] shadow-[0_1px_6px_rgba(15,105,176,0.04)]">
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${role.color}15` }}>
                    <Shield className="h-5 w-5" style={{ color: role.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm font-black text-foreground">{role.name}</h3>
                      {role.isSystem && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.08] text-muted-foreground">System</span>}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">{role.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{role.usersCount} users</span>
                      <span>{getTotalPermissions(role.permissions)} permissions</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditingId(editingId === role.id ? null : role.id)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {!role.isSystem && (
                    <button onClick={() => setDeleteDialog({ open: true, item: role })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {permissionModules.filter((m) => (role.permissions?.[m.key] || []).length > 0).map((m) => (
                  <span key={m.key} className="text-[9px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${role.color}15`, color: role.color }}>
                    {m.label}: {(role.permissions?.[m.key] || []).join(", ")}
                  </span>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {editingId === role.id && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] p-4">
                  <RoleForm
                    role={role}
                    onSave={async (data) => {
                      const res = await onSave(role.id, data);
                      if (res?.success) { toast.success("Role updated!"); setEditingId(null); }
                      else toast.error("Failed to update role");
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

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete} title="Delete Role" description={`Are you sure you want to delete "${deleteDialog.item?.name}"? Users with this role will need to be reassigned.`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}