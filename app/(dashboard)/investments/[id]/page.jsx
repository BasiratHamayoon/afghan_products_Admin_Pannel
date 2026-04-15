// app/(dashboard)/investments/[id]/page.jsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, BarChart3, DollarSign,
  Users, Target, Calendar, Star,
  XCircle, TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import InvestmentForm from "@/components/investments/InvestmentForm";
import InvestmentDetails from "@/components/investments/InvestmentDetails";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchInvestmentById, removeInvestment, editInvestment } from "@/store/actions/investmentsActions";
import { investmentTypeOptions } from "@/data/dummyInvestments";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Overview", "Edit"];

export default function InvestmentDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedInvestment: investment, isLoading } = useSelector((state) => state.investments);
  const [activeTab, setActiveTab] = useState("Overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInvestmentById(id));
    }
  }, [dispatch, id]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editInvestment(id, data));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Investment updated successfully!");
      setActiveTab("Overview");
      dispatch(fetchInvestmentById(id));
    } else {
      toast.error("Failed to update investment");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeInvestment(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Investment deleted");
      router.push("/investments");
    } else {
      toast.error("Failed to delete investment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading investment..." />
      </div>
    );
  }

  if (!investment || !investment.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Investment not found</h2>
        <p className="text-sm text-muted-foreground font-medium">
          The investment you are looking for does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/investments")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Investments
        </button>
      </div>
    );
  }

  const typeInfo = investmentTypeOptions.find((t) => t.value === investment.type) || { icon: "📦", label: investment.type, color: "#6b7280" };
  const pct = investment.targetAmount > 0 ? Math.min((investment.investedAmount / investment.targetAmount) * 100, 100) : 0;

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={investment.title || "Investment Detail"}
        description={`Manage details for ${investment.title || "this investment"}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/investments")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={() => setActiveTab("Edit")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div className="relative mb-3">
            {investment.image ? (
              <div className="h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                <img src={investment.image} alt={investment.title} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: `${typeInfo.color}18` }}
              >
                {typeInfo.icon}
              </div>
            )}
            {investment.featured && (
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          <h3 className="text-base font-black text-foreground mb-1">{investment.title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-2">{investment.location}</p>
          <StatusBadge status={investment.status || "pending"} />
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-foreground">{pct.toFixed(0)}% funded</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: typeInfo.color }} />
            </div>
          </div>
        </motion.div>

        {[
          {
            label: "Invested Amount",
            value: `$${(investment.investedAmount || 0).toLocaleString()}`,
            icon: DollarSign,
            color: "rgba(15,105,176,0.1)",
            iconColor: "#0F69B0",
          },
          {
            label: "Total Returns",
            value: `$${(investment.returnAmount || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: "rgba(16,185,129,0.1)",
            iconColor: "#10b981",
          },
          {
            label: "Investors",
            value: investment.investorsCount || 0,
            icon: Users,
            color: "rgba(124,58,237,0.1)",
            iconColor: "#7c3aed",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between"
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.color }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <InvestmentDetails investment={investment} />
              </motion.div>
            )}

            {activeTab === "Edit" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <InvestmentForm
                  initialData={investment}
                  onSubmit={handleUpdate}
                  onCancel={() => setActiveTab("Overview")}
                  isLoading={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Investment"
        description={`Are you sure you want to delete "${investment.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}