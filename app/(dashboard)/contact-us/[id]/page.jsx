"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, XCircle, Loader2,
  MessageCircle, User, Mail, Phone,
  Calendar, Tag, FileText,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { fetchContactMessageById } from "@/store/actions/contactUsActions";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  UNREAD: {
    label: "Unread",
    bg: "bg-blue-500/10",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  READ: {
    label: "Read",
    bg: "bg-gray-500/10",
    text: "text-gray-500",
    dot: "bg-gray-400",
  },
  REPLIED: {
    label: "Replied",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContactMessageDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedMessage: message, isLoading } = useSelector(
    (state) => state.contactUs
  );

  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      const res = await dispatch(fetchContactMessageById(id));
      if (!cancelled && !res?.success) setNotFound(true);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, dispatch]);

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading message...
          </p>
        </div>
      </div>
    );
  }

  // Not found
  if (notFound || (!isLoading && !message?.id)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          Message not found
        </h2>
        <button
          onClick={() => router.push("/contact-us")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Messages
        </button>
      </div>
    );
  }

  const status = statusConfig[message.status] || statusConfig.UNREAD;

  const infoFields = [
    { label: "Name", value: message.name, icon: User },
    { label: "Email", value: message.email, icon: Mail },
    { label: "Phone", value: message.phone, icon: Phone },
    { label: "Subject", value: message.subject, icon: Tag },
    { label: "Status", value: status.label, icon: Tag },
    { label: "Received", value: formatDate(message.createdAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Message Detail"
        description={message.subject || "Contact Message"}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/contact-us")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {message.email && (
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href={`mailto:${message.email}?subject=Re: ${message.subject || "Your Message"}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
              style={{
                background:
                  "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
              }}
            >
              <Mail className="h-4 w-4" />
              Reply via Email
            </motion.a>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Sender Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden flex flex-col items-center text-center"
        >
          {/* Banner */}
          <div
            className="h-24 w-full relative"
            style={{
              background:
                "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
            }}
          >
            <div className="absolute inset-0">
              <div
                className="absolute -top-8 -right-8 w-28 h-28 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div
                className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="-mt-8 mb-3 relative z-10">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center shadow-xl ring-[3px] ring-white dark:ring-[#0f1420] text-lg font-black text-white"
              style={{
                background:
                  "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
              }}
            >
              {getInitials(message.name)}
            </div>
          </div>

          <div className="px-5 pb-5 w-full">
            <h3 className="text-base font-black text-foreground mb-1">
              {message.name || "Unknown Sender"}
            </h3>

            {/* Status */}
            <div className="flex items-center justify-center mb-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full",
                  status.bg,
                  status.text
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
                />
                {status.label}
              </span>
            </div>

            {/* Email */}
            {message.email && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Mail className="h-3.5 w-3.5" />
                {message.email}
              </div>
            )}

            {/* Phone */}
            {message.phone && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                <Phone className="h-3.5 w-3.5" />
                {message.phone}
              </div>
            )}

            {/* Date */}
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(message.createdAt)}
            </div>
          </div>
        </motion.div>

        {/* Right Side */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Info Grid */}
          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">
                Sender Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {infoFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(15,105,176,0.08)" }}
                    >
                      <FieldIcon className="h-3.5 w-3.5 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-xs font-bold text-foreground break-all">
                        {field.value || "—"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          {message.subject && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">
                  Subject
                </h3>
              </div>
              <p className="text-sm font-bold text-foreground">
                {message.subject}
              </p>
            </div>
          )}

          {/* Message Body */}
          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">
                Message
              </h3>
            </div>
            <div className="p-4 rounded-xl border border-[#0F69B0]/10 bg-[#0F69B0]/[0.02]">
              <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                {message.message || "No message content"}
              </p>
            </div>
          </div>

          {/* Reply CTA */}
          {message.email && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">
                  Quick Reply
                </h3>
              </div>
              <p className="text-xs text-muted-foreground font-medium mb-3">
                Click below to open your email client and reply to this
                message.
              </p>
              <a
                href={`mailto:${message.email}?subject=Re: ${message.subject || "Your Message"}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                }}
              >
                <Mail className="h-4 w-4" />
                Reply to {message.name || message.email}
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}