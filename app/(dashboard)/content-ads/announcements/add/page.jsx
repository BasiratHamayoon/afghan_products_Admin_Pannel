"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Megaphone } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AnnouncementForm from "@/components/content/AnnouncementForm";
import { createAnnouncement } from "@/store/actions/contentActions";
import toast from "react-hot-toast";

export default function AddAnnouncementPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    const res = await dispatch(createAnnouncement(data));
    setIsLoading(false);
    if (res?.success) {
      toast.success("Announcement created successfully!");
      router.push("/content-ads/announcements");
    } else {
      toast.error("Failed to create announcement");
    }
  };

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="New Announcement" description="Create a new platform-wide announcement or notice">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/content-ads")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <Megaphone className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Announcement Details</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Fill in the details to create a new announcement</p>
          </div>
        </div>
        <AnnouncementForm
          initialData={{}}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/content-ads/announcements")}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}