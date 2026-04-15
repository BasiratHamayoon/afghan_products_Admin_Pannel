"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, CheckCircle,
  XCircle, ToggleLeft, ToggleRight,
  Ban, LayoutDashboard, User,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UserDetail from "@/components/users/UserDetails";
import UserForm from "@/components/users/UserForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import {
  fetchUserById, removeUser, editUser,
  suspendUser, verifyUser, banUser,
} from "@/store/actions/usersActions";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/formatters";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "edit", label: "Edit User", icon: User },
];

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { selectedUser: user, isLoading } = useSelector((state) => state.users);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id === "add") {
      router.replace("/users-sellers/add");
      return;
    }
    if (id) dispatch(fetchUserById(id));
  }, [dispatch, id, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "edit") {
      setActiveTab("edit");
    }
  }, [searchParams]);

  const handleUpdate = async (data) => {
    if (!id || id === "add") return;
    setIsSaving(true);
    const res = await dispatch(editUser(id, data));
    setIsSaving(false);
    if (res?.success) {
      toast.success("User updated!");
      setActiveTab("overview");
      router.replace(`/users-sellers/${id}`);
    } else {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!id || id === "add") return;
    setIsDeleting(true);
    const res = await dispatch(removeUser(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("User deleted");
      router.push("/users-sellers");
    } else {
      toast.error("Failed to delete");
    }
  };

  const handleSuspend = async () => {
    if (!user?.id) return;
    const res = await dispatch(suspendUser(user.id));
    if (res?.success) {
      toast.success(`User ${res.status === "suspended" ? "suspended" : "activated"}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleVerify = async () => {
    if (!user?.id) return;
    const res = await dispatch(verifyUser(user.id));
    if (res?.success) toast.success("User verified successfully");
    else toast.error("Failed to verify user");
  };

  const handleBan = async () => {
    if (!user?.id) return;
    const res = await dispatch(banUser(user.id));
    if (res?.success) {
      toast.success(`User ${res.banned ? "banned" : "unbanned"} successfully`);
    } else {
      toast.error("Failed to update");
    }
  };

  if (id === "add") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Redirecting..." />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading user..." />
      </div>
    );
  }

  if (!user || !user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground mb-1">User not found</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm">
            The user you are looking for does not exist or has been removed.
          </p>
        </div>
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

  const roleColors = {
    seller: "#0F69B0",
    buyer: "#7c3aed",
    admin: "#10b981",
  };
  const roleColor = roleColors[user.role] || "#0F69B0";

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title={user.name || "User Detail"}
        description={`${user.role?.charAt(0).toUpperCase()}${user.role?.slice(1)} · ${user.email}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => router.push("/users-sellers")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {!user.verified && (
            <button
              onClick={handleVerify}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-green-200 dark:border-green-800/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Verify</span>
            </button>
          )}

          <button
            onClick={handleSuspend}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer",
              user.status === "suspended"
                ? "border-green-200 dark:border-green-800/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "border-orange-200 dark:border-orange-800/40 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            )}
          >
            {user.status === "suspended" ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {user.status === "suspended" ? "Activate" : "Suspend"}
            </span>
          </button>

          <button
            onClick={handleBan}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer",
              user.banned
                ? "border-green-200 dark:border-green-800/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            )}
          >
            <Ban className="h-4 w-4" />
            <span className="hidden sm:inline">{user.banned ? "Unban" : "Ban"}</span>
          </button>

          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            onClick={() => setActiveTab("edit")}
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
              className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}cc 100%)` }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {user.name}
              </p>
              <StatusBadge status={user.status} className="mt-0.5" />
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
                      ? `/users-sellers/${id}?tab=edit`
                      : `/users-sellers/${id}`
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
                <UserDetail user={user} />
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
                <UserForm
                  initialData={user}
                  onSubmit={handleUpdate}
                  onCancel={() => {
                    setActiveTab("overview");
                    router.replace(`/users-sellers/${id}`);
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
        title="Delete User"
        description={`Are you sure you want to delete "${user.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}