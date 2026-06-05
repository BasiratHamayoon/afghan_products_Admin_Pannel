"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Trash2, ToggleLeft, ToggleRight,
  XCircle, Loader2, Mail, ShoppingBag,
  Package, Shield, Building, Hash, Calendar,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchUserById,
  deleteUser,
  updateUserStatus,
} from "@/store/actions/usersActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const roleConfig = {
  SELLER: { label: "Seller", bg: "rgba(15,105,176,0.1)", text: "#0F69B0", icon: ShoppingBag },
  BUYER: { label: "Buyer", bg: "rgba(124,58,237,0.1)", text: "#7c3aed", icon: Package },
  ADMIN: { label: "Admin", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: Shield },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function UserDetailContent() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedUser, isLoading } = useSelector((state) => state.users);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!id || id === "add") return;
    if (fetchKeyRef.current === id) return;
    fetchKeyRef.current = id;

    const load = async () => {
      const res = await dispatch(fetchUserById(id));
      if (!isMountedRef.current) return;
      if (!res?.success) setNotFound(true);
    };
    load();
  }, [id, dispatch]);

  const currentUser = selectedUser?.id === id ? selectedUser : null;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(deleteUser(id));
    setIsDeleting(false);
    setDeleteDialog(false);
    if (res?.success) {
      toast.success("User deleted");
      router.push("/users-sellers");
    } else {
      toast.error(res?.message || "Failed to delete");
    }
  };

  const handleStatusConfirm = async () => {
    if (!currentUser?.id || !statusDialog.newStatus) {
      setStatusDialog({ open: false, newStatus: null });
      return;
    }
    setIsUpdating(true);
    const res = await dispatch(updateUserStatus(currentUser.id, statusDialog.newStatus));
    setIsUpdating(false);
    setStatusDialog({ open: false, newStatus: null });
    if (res?.success) {
      toast.success(statusDialog.newStatus === "BLOCKED" ? "User blocked" : "User activated");
    } else {
      toast.error(res?.message || "Failed to update status");
    }
  };

  const handleToggleStatus = () => {
    const currentStatus = (currentUser?.status || "ACTIVE").toUpperCase();
    const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setStatusDialog({ open: true, newStatus });
  };

  if (isLoading && !currentUser) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">Loading user...</p>
        </div>
      </div>
    );
  }

  if (notFound || (!isLoading && !currentUser?.id)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">User not found</h2>
        <p className="text-sm text-muted-foreground font-medium">
          The user does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/users-sellers")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </button>
      </div>
    );
  }

  if (!currentUser) return null;

  const role = roleConfig[currentUser?.role] || roleConfig.BUYER;
  const RoleIcon = role.icon;
  const userStatus = (currentUser?.status || "ACTIVE").toUpperCase();
  const isBlocked = userStatus === "BLOCKED";

  const detailFields = [
    { label: "User ID", value: currentUser?.id, icon: Hash },
    { label: "First Name", value: currentUser?.firstName, icon: Mail },
    { label: "Last Name", value: currentUser?.lastName, icon: Mail },
    { label: "Email", value: currentUser?.email, icon: Mail },
    { label: "Role", value: role.label, icon: RoleIcon },
    {
      label: "Status",
      value: isBlocked ? "Blocked" : "Active",
      icon: isBlocked ? ToggleLeft : ToggleRight,
      isStatus: true,
    },
    { label: "Has Business", value: currentUser?.hasBusiness ? "Yes" : "No", icon: Building },
    { label: "Created", value: formatDate(currentUser?.createdAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title={currentUser?.name || "User Detail"}
        description={`${role.label} · ${currentUser?.email || ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/users-sellers")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleToggleStatus}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer",
              isBlocked
                ? "border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                : "border-amber-200 dark:border-amber-800/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
            )}
          >
            {isBlocked ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {isBlocked ? "Activate" : "Block"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div
            className="h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-4"
            style={{
              background: `linear-gradient(135deg, ${role.text} 0%, ${role.text}cc 100%)`,
            }}
          >
            {getInitials(currentUser?.name)}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{currentUser?.name}</h3>
          <p className="text-xs text-muted-foreground font-medium mb-3">{currentUser?.email}</p>

          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 mb-2"
            style={{ background: role.bg, color: role.text }}
          >
            <RoleIcon className="h-3 w-3" />
            {role.label}
          </span>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full",
              isBlocked
                ? "bg-red-500/10 text-red-500"
                : "bg-emerald-500/10 text-emerald-600"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                isBlocked ? "bg-red-500" : "bg-emerald-500"
              )}
            />
            {isBlocked ? "Blocked" : "Active"}
          </span>

          {currentUser?.hasBusiness && (
            <div className="flex items-center gap-1.5 mt-3 p-2.5 rounded-xl bg-[#0F69B0]/5 border border-[#0F69B0]/10 w-full">
              <Building className="h-4 w-4 text-[#0F69B0] shrink-0" />
              <p className="text-[11px] font-bold text-[#0F69B0]">Has Business Profile</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
        >
          <h3 className="text-sm font-black text-foreground mb-5">User Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detailFields.map((field) => {
              const FieldIcon = field.icon;
              return (
                <div
                  key={field.label}
                  className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(15,105,176,0.08)" }}
                  >
                    <FieldIcon className="h-4 w-4 text-[#0F69B0]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                      {field.label}
                    </p>
                    {field.isStatus ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                          isBlocked
                            ? "bg-red-500/10 text-red-500"
                            : "bg-emerald-500/10 text-emerald-600"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            isBlocked ? "bg-red-500" : "bg-emerald-500"
                          )}
                        />
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    ) : (
                      <p className="text-sm font-bold text-foreground break-all">
                        {field.value || "—"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete "${currentUser?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, newStatus: null })}
        onConfirm={handleStatusConfirm}
        title={statusDialog.newStatus === "BLOCKED" ? "Block User" : "Activate User"}
        description={`Are you sure you want to ${statusDialog.newStatus === "BLOCKED" ? "block" : "activate"} "${currentUser?.name}"?`}
        confirmLabel={statusDialog.newStatus === "BLOCKED" ? "Block" : "Activate"}
        isLoading={isUpdating}
        variant={statusDialog.newStatus === "BLOCKED" ? "warning" : "primary"}
      />
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <Suspense fallback={null}>
      <UserDetailContent />
    </Suspense>
  );
}