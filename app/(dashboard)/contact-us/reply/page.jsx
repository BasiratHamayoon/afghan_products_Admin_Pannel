"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Reply, Loader2, Mail, Phone, FileText, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { fetchContactMessageById, replyToContactMessage } from "@/store/actions/contactUsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function ReplyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const messageId = searchParams.get("id") || null;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [messageData, setMessageData] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [errors, setErrors] = useState({});

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!messageId || fetchedRef.current) {
      if (!messageId) {
        toast.error(t("contactUs.noMessageId"));
        router.push("/contact-us");
      }
      return;
    }
    fetchedRef.current = true;

    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchContactMessageById(messageId));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          setMessageData(res.data);
        } else {
          toast.error(t("contactUs.failedToLoadMessage"));
          router.push("/contact-us");
        }
      } catch {
        if (isMountedRef.current) {
          toast.error(t("contactUs.somethingWentWrong"));
          router.push("/contact-us");
        }
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [messageId, dispatch, router, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!replyText.trim()) errs.reply = t("contactUs.replyRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsLoading(true);
    try {
      const res = await dispatch(replyToContactMessage(messageId, { replyMessage: replyText.trim() }));
      if (res?.success) {
        toast.success(t("contactUs.replySentSuccess"));
        router.push(`/contact-us/${messageId}`);
      } else {
        toast.error(res?.message || t("contactUs.failedToSendReply"));
      }
    } catch {
      toast.error(t("contactUs.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || !messageData) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">{t("contactUs.loadingMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("contactUs.replyTitle")} description={`${t("contactUs.replyingTo")} ${messageData.name}`}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/contact-us")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("contactUs.back")}
        </motion.button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <Reply className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{t("contactUs.replyTitle")}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("contactUs.replyDesc")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{t("contactUs.senderInformation")}</p>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  {getInitials(messageData.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{messageData.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 text-muted-foreground/50" />
                    <p className="text-[11px] text-muted-foreground font-medium truncate">{messageData.email}</p>
                  </div>
                  {messageData.phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground/50" />
                      <p className="text-[11px] text-muted-foreground font-medium">{messageData.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {messageData.subject && (
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground/50" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("contactUs.subjectField")}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{messageData.subject}</p>
              </div>
            )}

            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("contactUs.originalMessage")}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{messageData.message || t("contactUs.noMessageContent")}</p>
            </div>

            {messageData.adminReply && (
              <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <Reply className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{t("contactUs.previousReply")}</p>
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">{messageData.adminReply}</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("contactUs.yourReply")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => { setReplyText(e.target.value); if (errors.reply) setErrors((p) => ({ ...p, reply: "" })); }}
                  placeholder={t("contactUs.replyPlaceholder")}
                  rows={10}
                  disabled={isLoading}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text resize-none disabled:opacity-60",
                    errors.reply ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
                  )}
                />
                {errors.reply && <p className="text-[11px] text-red-500 font-semibold">{errors.reply}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                <button type="button" onClick={() => router.push("/contact-us")} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  <X className="h-4 w-4" />{t("contactUs.cancel")}
                </button>
                <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("contactUs.sending")}</> : <><Reply className="h-4 w-4" />{t("contactUs.sendReply")}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ReplyPage() {
  return <Suspense fallback={null}><ReplyContent /></Suspense>;
}