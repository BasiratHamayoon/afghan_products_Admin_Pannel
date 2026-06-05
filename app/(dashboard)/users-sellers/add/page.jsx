"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Building, Loader2, Save, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { createBusiness } from "@/store/actions/businessesActions";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const OWNERSHIP_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Cooperative",
  "Other",
];

export default function AddBusinessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [tin, setTin] = useState("");
  const [ownershipType, setOwnershipType] = useState("LLC");
  const [description, setDescription] = useState("");
  const [yearOfEstablishment, setYearOfEstablishment] = useState(
    new Date().getFullYear()
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!businessName.trim()) errs.businessName = "Business name is required";
    if (!businessEmail.trim()) errs.businessEmail = "Business email is required";
    if (
      businessEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)
    ) {
      errs.businessEmail = "Valid email is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        businessPhone: businessPhone.trim() || undefined,
        businessEmail: businessEmail.trim(),
        businessAddress: businessAddress.trim() || undefined,
        tin: tin.trim() || undefined,
        ownershipType,
        description: description.trim() || undefined,
        yearOfEstablishment: Number(yearOfEstablishment),
      };

      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      const res = await dispatch(createBusiness(payload));
      if (res?.success) {
        toast.success("Business profile created successfully!");
        router.push("/verifications");
      } else {
        toast.error(res?.message || "Failed to create business profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (field) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const fieldClass = (field) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Create Business Profile"
        description="Create a new seller business profile"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/users-sellers")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(15,105,176,0.1)" }}
          >
            <Building className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">
              Business Profile
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Fill in the business details below
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    clearError("businessName");
                  }}
                  placeholder="e.g. Afghan Trading Co."
                  disabled={isLoading}
                  className={fieldClass("businessName")}
                />
                {errors.businessName && (
                  <p className="text-[11px] text-red-500 font-semibold">
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Business Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={businessEmail}
                  onChange={(e) => {
                    setBusinessEmail(e.target.value);
                    clearError("businessEmail");
                  }}
                  placeholder="e.g. contact@afghantrading.com"
                  disabled={isLoading}
                  className={fieldClass("businessEmail")}
                />
                {errors.businessEmail && (
                  <p className="text-[11px] text-red-500 font-semibold">
                    {errors.businessEmail}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Business Phone
                </label>
                <input
                  type="text"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="e.g. +93 700 123 456"
                  disabled={isLoading}
                  className={fieldClass("businessPhone")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Business Address
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="e.g. Kabul, Afghanistan"
                  disabled={isLoading}
                  className={fieldClass("businessAddress")}
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  TIN (Tax Identification Number)
                </label>
                <input
                  type="text"
                  value={tin}
                  onChange={(e) => setTin(e.target.value)}
                  placeholder="e.g. 123456789"
                  disabled={isLoading}
                  className={fieldClass("tin")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Ownership Type
                </label>
                <select
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value)}
                  disabled={isLoading}
                  className={cn(
                    fieldClass("ownershipType"),
                    "cursor-pointer bg-white dark:bg-[#0f1420]"
                  )}
                >
                  {OWNERSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Year of Establishment
                </label>
                <input
                  type="number"
                  value={yearOfEstablishment}
                  onChange={(e) =>
                    setYearOfEstablishment(e.target.value)
                  }
                  min="1900"
                  max={new Date().getFullYear()}
                  disabled={isLoading}
                  className={fieldClass("yearOfEstablishment")}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Wholesale importer and exporter of agricultural products."
                  rows={4}
                  disabled={isLoading}
                  className={cn(fieldClass("description"), "resize-none")}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => router.push("/users-sellers")}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Business Profile
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}