"use client";

import { motion } from "framer-motion";
import {
  Eye, Mail, Reply, Archive, ArchiveRestore,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export const statusConfig = {
  UNREAD: { label: "Unread", bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  READ: { label: "Read", bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  REPLIED: { label: "Replied", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function ContactMessagesTable({
  messages = [],
  onView,
  onReply,
  onArchive,
  onUnarchive,
}) {
  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];
  if (safeMessages.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Sender", "Subject", "Message", "Status", "Date", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeMessages.map((msg, i) => {
            if (!msg?.id) return null;
            const status = statusConfig[msg.status] || statusConfig.UNREAD;
            const isUnread = msg.status === "UNREAD";

            return (
              <motion.tr
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className={cn(
                  "border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors cursor-pointer",
                  isUnread && "bg-blue-50/30 dark:bg-blue-900/[0.05]"
                )}
                onClick={() => onView?.(msg)}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                    >
                      {getInitials(msg.name)}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-[11px] truncate max-w-[130px]", isUnread ? "font-black text-foreground" : "font-bold text-foreground")}>
                        {msg.name || "—"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground/50" />
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[130px]">
                          {msg.email || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className={cn("text-xs truncate max-w-[160px]", isUnread ? "font-bold text-foreground" : "font-medium text-foreground")}>
                    {msg.subject || "No Subject"}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">
                    {msg.message || "—"}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap w-fit", status.bg, status.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                    {msg.isArchived && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 w-fit">
                        Archived
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {formatDate(msg.createdAt)}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView?.(msg); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onReply?.(msg); }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer"
                      title="Reply"
                    >
                      <Reply className="h-3.5 w-3.5" />
                    </button>
                    {msg.isArchived ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); onUnarchive?.(msg); }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-600 transition-all cursor-pointer"
                        title="Unarchive"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); onArchive?.(msg); }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600 transition-all cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}