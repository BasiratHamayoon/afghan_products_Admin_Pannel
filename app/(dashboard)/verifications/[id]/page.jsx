"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, FileText, Info, XCircle,
  LayoutDashboard, Shield,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import VerificationDetails from "@/components/verifications/VerificationDetails";
import DocumentViewer from "@/components/verifications/DocumentViewer";
import VerificationActions from "@/components/verifications/VerificationActions";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import StatusBadge from "@/components/common/StatusBadge";
import {
  fetchVerificationById, approveVerification,
  rejectVerification, requestMoreInfo, verifyDocument,
} from "@/store/actions/verificationsActions";
import { priorityConfig, verificationTypeLabels } from "@/data/dummyVerifications";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = [
  { id: "details", label: "Details", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
];

export default function VerificationDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedVerification: verification, isLoading } = useSelector((state) => state.verifications);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("details");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchVerificationById(id));
  }, [dispatch, id]);

  const handleApprove = async (verificationId) => {
    setIsProcessing(true);
    const res = await dispatch(approveVerification(verificationId, user?.name || "Admin"));
    setIsProcessing(false);
    if (res?.success) toast.success("Verification approved successfully");
    else toast.error("Failed to approve");
  };

  const handleReject = async (verificationId, reason) => {
    setIsProcessing(true);
    const res = await dispatch(rejectVerification(verificationId, reason, user?.name || "Admin"));
    setIsProcessing(false);
    if (res?.success) toast.success("Verification rejected");
    else toast.error("Failed to reject");
  };

  const handleRequestInfo = async (verificationId, note) => {
    const res = await dispatch(requestMoreInfo(verificationId, note, user?.name || "Admin"));
    if (res?.success) toast.success("Note added successfully");
    else toast.error("Failed to add note");
  };

  const handleVerifyDocument = async (verificationId, documentId) => {
    const res = await dispatch(verifyDocument(verificationId, documentId));
    if (res?.success) toast.success("Document status updated");
    else toast.error("Failed to update document");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading verification..." />
      </div>
    );
  }

  if (!verification || !verification.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground mb-1">Verification not found</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm">
            The verification request you are looking for does not exist.
          </p>
        </div>
        <button
          onClick={() => router.push("/verifications")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Verifications
        </button>
      </div>
    );
  }

  const priority = priorityConfig[verification.priority] || priorityConfig.medium;

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title={`${verification.userName}'s Verification`}
        description={`${verificationTypeLabels[verification.type] || verification.type} · ${verification.userEmail}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => router.push("/verifications")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
            <div className="flex items-center gap-1 p-3 sm:p-4 border-b border-gray-50 dark:border-white/[0.04] overflow-x-auto scrollbar-thin">
              <div className="flex items-center gap-2 mr-4 shrink-0">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                    {verification.userName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <StatusBadge status={verification.status} />
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: priority.bg, color: priority.text }}
                    >
                      {priority.label}
                    </span>
                  </div>
                </div>
              </div>

              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0",
                      activeTab === tab.id
                        ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                        : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.id === "documents" && (
                      <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-white/20" : "bg-gray-100 dark:bg-white/[0.08]")}>
                        {verification.documents?.length || 0}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-5">
              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <VerificationDetails verification={verification} />
                  </motion.div>
                )}

                {activeTab === "documents" && (
                  <motion.div
                    key="documents"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DocumentViewer
                      documents={verification.documents}
                      onVerifyDocument={handleVerifyDocument}
                      verificationId={verification.id}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <VerificationActions
            verification={verification}
            onApprove={handleApprove}
            onReject={handleReject}
            onRequestInfo={handleRequestInfo}
            isLoading={isProcessing}
          />

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Quick Info</h3>
            <div className="space-y-2.5">
              {[
                { label: "Verification ID", value: verification.id },
                { label: "Type", value: verificationTypeLabels[verification.type] || verification.type },
                { label: "User Role", value: verification.userRole?.charAt(0).toUpperCase() + verification.userRole?.slice(1) },
                { label: "Documents", value: `${verification.documents?.length || 0} submitted` },
                { label: "Score", value: `${verification.score || 0}/100` },
                { label: "Notes", value: `${verification.notes?.length || 0} notes` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-white/[0.04] last:border-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}