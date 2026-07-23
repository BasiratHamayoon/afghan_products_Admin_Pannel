"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AboutForm from "@/components/about/AboutForm";
import { createAboutItem, updateAboutItem, fetchAboutById, fetchAboutItems } from "@/store/actions/aboutActions";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

function AddAboutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [initialData, setInitialData] = useState(null);

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!editId) { setInitialData({}); return; }
    const fetchKey = `about:${editId}`;
    if (fetchKeyRef.current === fetchKey) return;
    fetchKeyRef.current = fetchKey;

    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchAboutById(editId));
        if (!isMountedRef.current) return;
        if (res?.success) {
          setInitialData(res.data);
        } else {
          toast.error(t("about.failedToLoad"));
          setInitialData({});
        }
      } catch {
        if (isMountedRef.current) {
          toast.error(t("about.somethingWentWrong"));
          setInitialData({});
        }
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [editId, dispatch, t]);

  const handleSubmit = async (payload) => {
    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateAboutItem(editId, payload))
        : await dispatch(createAboutItem(payload));

      if (res?.success) {
        toast.success(isEditMode ? t("about.aboutUpdated") : t("about.aboutCreated"));
        dispatch(fetchAboutItems());
        router.push("/about");
      } else {
        toast.error(res?.message || (isEditMode ? t("about.failedToUpdate") : t("about.failedToCreate")));
      }
    } catch {
      toast.error(t("about.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || initialData === null) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">
            {isEditMode ? t("about.loadingAbout") : t("about.preparingForm")}
          </p>
        </div>
      </div>
    );
  }

  const title = isEditMode ? t("about.editAboutTitle") : t("about.addAboutTitle");
  const desc = isEditMode ? t("about.editAboutDesc") : t("about.addAboutDesc");

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={title} description={desc}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/about")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("about.back")}
        </motion.button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <Info className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{desc}</p>
          </div>
        </div>

        <AboutForm initialData={initialData} onSubmit={handleSubmit} onCancel={() => router.push("/about")} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}

export default function AddAboutPage() {
  return <Suspense fallback={null}><AddAboutContent /></Suspense>;
}