"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PaymentGateways from "@/components/settings/PaymentGateways";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchPaymentGateways, savePaymentGateway, createPaymentGateway, deletePaymentGateway } from "@/store/actions/settingsActions";
import toast from "react-hot-toast";

export default function PaymentGatewaysPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { paymentGateways, isLoading, isSaving } = useSelector((s) => s.settings);

  useEffect(() => { dispatch(fetchPaymentGateways()); }, [dispatch]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="Payment Gateways" description="Configure and manage payment methods for the platform">
        <button onClick={() => router.push("/settings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Back
        </button>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
            <CreditCard className="h-5 w-5 text-[#10b981]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Payment Gateways</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Manage payment providers and transaction settings</p>
          </div>
        </div>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Loading payment gateways..." className="py-16" />
        ) : (
          <PaymentGateways
            gateways={paymentGateways}
            onSave={(id, data) => dispatch(savePaymentGateway(id, data))}
            onCreate={(data) => dispatch(createPaymentGateway(data))}
            onDelete={(id) => dispatch(deletePaymentGateway(id))}
            isSaving={isSaving}
          />
        )}
      </div>
    </div>
  );
}