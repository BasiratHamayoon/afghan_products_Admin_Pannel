"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, MessageSquare, Loader2, Save, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { addFaq, updateFaq, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function AddFaqContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const isRTL = currentLang === "fa" || currentLang === "ps";
  const lang = currentLang === "ps" ? "ps" : currentLang === "fa" ? "fa" : "en";

  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;
  const { faqs } = useSelector((state) => state.helpCenter);

  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const getFieldValue = (item, multiKey, flatKey) => {
    if (!item) return "";
    if (item[multiKey] && typeof item[multiKey] === "object") {
      return (
        item[multiKey][currentLang] ||
        item[multiKey].en ||
        item[multiKey].fa ||
        item[multiKey].ps ||
        ""
      );
    }
    if (item[flatKey] && typeof item[flatKey] === "object") {
      return (
        item[flatKey][currentLang] ||
        item[flatKey].en ||
        item[flatKey].fa ||
        item[flatKey].ps ||
        ""
      );
    }
    return typeof item[flatKey] === "string" ? item[flatKey] : "";
  };

  useEffect(() => {
    if (!editId || !faqs?.length) return;
    const faq = faqs.find((f) => (f._id || f.id) === editId);
    if (faq) {
      setQuestion(getFieldValue(faq, "questionMultilingual", "question"));
      setAnswer(getFieldValue(faq, "answerMultilingual", "answer"));
      setOrder(faq.order ?? 0);
      setIsActive(faq.isActive ?? true);
    }
  }, [editId, faqs, currentLang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!question.trim()) errs.question = t("helpCenter.questionRequired");
    if (!answer.trim()) errs.answer = t("helpCenter.answerRequired");
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      question: { [lang]: question.trim() },
      answer: { [lang]: answer.trim() },
      order,
      isActive,
    };

    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateFaq(editId, payload))
        : await dispatch(addFaq(payload));

      if (res?.success) {
        toast.success(
          isEditMode ? t("helpCenter.updated2") : t("helpCenter.created")
        );
        dispatch(fetchHelpCenter());
        router.push("/help-center");
      } else {
        toast.error(res?.message || t("helpCenter.failedAction"));
      }
    } catch {
      toast.error(t("helpCenter.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const title = isEditMode
    ? t("helpCenter.editFaqTitle")
    : t("helpCenter.addFaqTitle");

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={title} description={t("helpCenter.faqFormDesc")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/help-center")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 rtl-mirror" />
          {t("helpCenter.back")}
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(15,105,176,0.1)" }}
          >
            <MessageSquare className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("helpCenter.questionLabel")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question)
                  setErrors((p) => ({ ...p, question: "" }));
              }}
              placeholder={t("helpCenter.questionPlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass(errors.question)}
            />
            {errors.question && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.question}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("helpCenter.answerLabel")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (errors.answer) setErrors((p) => ({ ...p, answer: "" }));
              }}
              rows={5}
              placeholder={t("helpCenter.answerPlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={cn(inputClass(errors.answer), "resize-none")}
            />
            {errors.answer && (
              <p className="text-[11px] text-red-500 font-semibold">
                {errors.answer}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.orderLabel")}
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
                disabled={isLoading}
                className={inputClass()}
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={isLoading}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                  isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                    isActive ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <p className="text-sm font-bold text-foreground">
                {t("helpCenter.activeLabel")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => router.push("/help-center")}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              {t("helpCenter.cancelLabel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("helpCenter.savingLabel")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode
                    ? t("helpCenter.updateFaqBtn")
                    : t("helpCenter.addFaqBtn")}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AddFaqPage() {
  return (
    <Suspense fallback={null}>
      <AddFaqContent />
    </Suspense>
  );
}