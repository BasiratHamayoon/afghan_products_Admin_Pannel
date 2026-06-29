"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Headphones, Search, Send, RefreshCw,
  X, Loader2, Paperclip, MessageCircle,
  CheckCheck, UserCheck, AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import {
  fetchAdminSupportConversations,
  fetchAdminSupportMessages,
  joinSupportConversation,
  adminReplyToSupport,
  fetchUnreadCount,
} from "@/store/actions/adminChatActions";
import {
  setActiveConversation,
} from "@/store/slices/adminChatSlice";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return formatDate(dateStr);
}

function UserAvatar({ name, src, size = "md", online = false }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8 text-[10px]"
      : size === "lg"
      ? "h-12 w-12 text-base"
      : "h-10 w-10 text-xs";

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center font-black text-white bg-gradient-to-br from-purple-500 to-purple-700",
          sizeClass
        )}
      >
        {src ? (
          <img
            src={getFileUrl(src)}
            alt={name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span>{name?.charAt(0)?.toUpperCase() || "?"}</span>
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f1420]" />
      )}
    </div>
  );
}

function AdminAvatar({ size = "sm" }) {
  const sizeClass =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
      ? "h-12 w-12"
      : "h-10 w-10";
  const textSize =
    size === "sm"
      ? "text-xs"
      : size === "lg"
      ? "text-lg"
      : "text-sm";

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-black text-white",
          sizeClass
        )}
        style={{
          background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
        }}
      >
        <span className={textSize}>A</span>
      </div>
    </div>
  );
}

export default function SupportChatPage() {
  const dispatch = useDispatch();
  const {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    isLoading,
    isMessagesLoading,
    conversationsPagination,
  } = useSelector((state) => state.adminChat);

  const { user: adminUser } = useSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchAdminSupportConversations({ page: 1, limit: 20 }));
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current)
        clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current)
      clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      dispatch(
        fetchAdminSupportConversations({
          page: 1,
          limit: 20,
          search: val,
        })
      );
    }, 500);
  };

  const handleRefresh = () => {
    dispatch(
      fetchAdminSupportConversations({
        page: 1,
        limit: 20,
        search: searchQuery,
      })
    );
    dispatch(fetchUnreadCount());
    if (activeConversation) {
      dispatch(fetchAdminSupportMessages(activeConversation.id, 1));
    }
  };

  const handleConversationClick = useCallback(
    async (conv) => {
      dispatch(setActiveConversation(conv));
      await dispatch(fetchAdminSupportMessages(conv.id, 1));
    },
    [dispatch]
  );

  const handleJoinConversation = async () => {
    if (!activeConversation?.id) return;
    setIsJoining(true);
    try {
      const res = await dispatch(
        joinSupportConversation(activeConversation.id)
      );
      if (res?.success) {
        toast.success("Joined conversation");
        dispatch(
          setActiveConversation({
            ...activeConversation,
            isAdminJoined: true,
          })
        );
        dispatch(
          fetchAdminSupportConversations({ page: 1, limit: 20 })
        );
      } else {
        toast.error(res?.message || "Failed to join");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && attachments.length === 0) return;
    if (!activeConversation?.id) return;

    setIsSending(true);
    try {
      const res = await dispatch(
        adminReplyToSupport(
          activeConversation.id,
          messageText.trim(),
          attachments
        )
      );
      if (res?.success) {
        setMessageText("");
        setAttachments([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (!activeConversation.isAdminJoined) {
          dispatch(
            setActiveConversation({
              ...activeConversation,
              isAdminJoined: true,
            })
          );
        }
      } else {
        toast.error(res?.message || "Failed to send");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const safeConversations = Array.isArray(conversations)
    ? conversations
    : [];
  const safeMessages = Array.isArray(messages) ? messages : [];
  const adminId = adminUser?._id || adminUser?.id;

  const isAdminMessage = (msg) => {
    return (
      msg.senderRole === "admin" ||
      msg.senderRole === "ADMIN" ||
      msg.senderId === adminId
    );
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Support Chat"
        description="View and reply to all user support conversations"
      >
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-500 text-white">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </PageHeader>

      <div
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: "560px" }}
      >
        <div className="flex h-full">
          {/* ─── Conversations Sidebar ──────────────────────────── */}
          <div className="w-72 xl:w-80 shrink-0 border-r border-gray-100 dark:border-white/[0.06] flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-[#0F69B0]" />
                  <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                    Support
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {conversationsPagination?.total || 0}
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    handleSearchChange(e.target.value)
                  }
                  placeholder="Search users..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl text-xs font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:bg-white dark:focus:bg-white/[0.06] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="h-3 w-3 text-muted-foreground/50 hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-[#0F69B0]" />
                </div>
              ) : safeConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                  <Headphones className="h-12 w-12 text-muted-foreground/15 mb-3" />
                  <p className="text-xs font-bold text-muted-foreground">
                    No support conversations
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium mt-1 leading-relaxed">
                    Users will appear here when they contact support
                  </p>
                </div>
              ) : (
                safeConversations.map((conv) => {
                  const isActive =
                    activeConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() =>
                        handleConversationClick(conv)
                      }
                      className={cn(
                        "flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all border-b border-gray-50 dark:border-white/[0.02]",
                        isActive
                          ? "bg-[#0F69B0]/[0.06] border-l-[3px] border-l-[#0F69B0]"
                          : "hover:bg-gray-50/60 dark:hover:bg-white/[0.02] border-l-[3px] border-l-transparent"
                      )}
                    >
                      <UserAvatar
                        name={conv.userName}
                        src={conv.userAvatar}
                        online={conv.userOnline}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p
                            className={cn(
                              "text-xs truncate max-w-[120px]",
                              conv.unreadCount > 0
                                ? "font-black text-foreground"
                                : "font-bold text-foreground"
                            )}
                          >
                            {conv.userName || "Unknown User"}
                          </p>
                          <span className="text-[9px] text-muted-foreground font-medium shrink-0">
                            {timeAgo(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-[10px] font-medium truncate max-w-[170px]",
                            conv.unreadCount > 0
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {conv.lastMessage?.content ||
                            "No messages yet"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {conv.isAdminJoined ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                              <UserCheck className="h-2.5 w-2.5" />
                              Joined
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                              <AlertCircle className="h-2.5 w-2.5" />
                              New
                            </span>
                          )}
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 capitalize">
                            {conv.userRole || "user"}
                          </span>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 h-5 min-w-[20px] px-1.5 rounded-full bg-[#0F69B0] text-white text-[10px] font-black flex items-center justify-center mt-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ─── Messages Panel ──────────────────────────────────── */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {!activeConversation ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5">
                <div className="h-24 w-24 rounded-3xl bg-[#0F69B0]/10 flex items-center justify-center">
                  <MessageCircle className="h-12 w-12 text-[#0F69B0]/40" />
                </div>
                <div className="text-center">
                  <p className="text-base font-black text-foreground">
                    Select a conversation
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-1.5 max-w-[260px] leading-relaxed">
                    Choose a support conversation from the sidebar to view messages and reply
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ─── Chat Header ──────────────────────────────── */}
                <div className="px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-3 shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={activeConversation.userName}
                      src={activeConversation.userAvatar}
                      online={activeConversation.userOnline}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground truncate">
                        {activeConversation.userName ||
                          "Unknown User"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <div className="flex items-center gap-1">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              activeConversation.userOnline
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            )}
                          />
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {activeConversation.userOnline
                              ? "Online"
                              : "Offline"}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 capitalize">
                          {activeConversation.userRole || "user"}
                        </span>
                        {activeConversation.isAdminJoined ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            <UserCheck className="h-3 w-3" />
                            Joined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                            <AlertCircle className="h-3 w-3" />
                            Not joined
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!activeConversation.isAdminJoined && (
                    <button
                      onClick={handleJoinConversation}
                      disabled={isJoining}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                      }}
                    >
                      {isJoining ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserCheck className="h-3.5 w-3.5" />
                      )}
                      Join & Reply
                    </button>
                  )}
                </div>

                {/* ─── Messages ──────────────────────────────────── */}
                <div
                  className="flex-1 overflow-y-auto px-5 py-6"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 50% 50%, rgba(15,105,176,0.02) 0%, transparent 70%)",
                  }}
                >
                  {isMessagesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0F69B0]" />
                    </div>
                  ) : safeMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                      <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
                      <p className="text-xs font-bold text-muted-foreground">
                        No messages in this conversation yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeMessages.map((msg) => {
                        const isMine = isAdminMessage(msg);

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex gap-2.5",
                              isMine
                                ? "flex-row-reverse"
                                : "flex-row"
                            )}
                          >
                            {/* Avatar */}
                            {isMine ? (
                              <AdminAvatar size="sm" />
                            ) : (
                              <UserAvatar
                                name={msg.senderName}
                                src={msg.senderAvatar}
                                size="sm"
                              />
                            )}

                            {/* Bubble */}
                            <div
                              className={cn(
                                "flex flex-col max-w-[60%]",
                                isMine
                                  ? "items-end"
                                  : "items-start"
                              )}
                            >
                              {/* Sender name */}
                              <p
                                className={cn(
                                  "text-[10px] font-bold mb-1 px-1",
                                  isMine
                                    ? "text-[#0F69B0]"
                                    : "text-muted-foreground"
                                )}
                              >
                                {isMine
                                  ? "Admin"
                                  : msg.senderName || "User"}
                              </p>

                              {/* Message bubble */}
                              {msg.content && (
                                <div
                                  className={cn(
                                    "px-4 py-3 text-sm font-medium leading-relaxed break-words shadow-sm",
                                    isMine
                                      ? "rounded-2xl rounded-tr-sm text-white"
                                      : "rounded-2xl rounded-tl-sm bg-white dark:bg-white/[0.08] text-foreground border border-gray-100 dark:border-white/[0.06]"
                                  )}
                                  style={
                                    isMine
                                      ? {
                                          background:
                                            "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                                        }
                                      : {}
                                  }
                                >
                                  {msg.content}
                                </div>
                              )}

                              {/* Attachments */}
                              {msg.attachments?.length > 0 && (
                                <div
                                  className={cn(
                                    "flex flex-wrap gap-1.5 mt-1.5",
                                    isMine
                                      ? "justify-end"
                                      : "justify-start"
                                  )}
                                >
                                  {msg.attachments.map(
                                    (att, ai) => (
                                      <a
                                        key={ai}
                                        href={getFileUrl(att)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={cn(
                                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer",
                                          isMine
                                            ? "bg-white/20 text-white hover:bg-white/30"
                                            : "bg-gray-100 dark:bg-white/[0.08] text-[#0F69B0] hover:bg-gray-200 dark:hover:bg-white/[0.12]"
                                        )}
                                      >
                                        <Paperclip className="h-3 w-3" />
                                        File {ai + 1}
                                      </a>
                                    )
                                  )}
                                </div>
                              )}

                              {/* Time + read status */}
                              <div
                                className={cn(
                                  "flex items-center gap-1.5 mt-1 px-1",
                                  isMine
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                )}
                              >
                                <span className="text-[9px] text-muted-foreground/70 font-medium">
                                  {timeAgo(msg.createdAt)}
                                </span>
                                {isMine && (
                                  <CheckCheck
                                    className={cn(
                                      "h-3 w-3",
                                      msg.status === "read"
                                        ? "text-[#0F69B0]"
                                        : "text-muted-foreground/40"
                                    )}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* ─── Attachments preview ───────────────────────── */}
                {attachments.length > 0 && (
                  <div className="px-5 py-2.5 border-t border-gray-100 dark:border-white/[0.06] flex items-center gap-2 flex-wrap shrink-0 bg-gray-50/50 dark:bg-white/[0.02]">
                    {attachments.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F69B0]/10 text-[11px] font-bold text-[#0F69B0]"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {file.name}
                        </span>
                        <button
                          onClick={() =>
                            handleRemoveAttachment(i)
                          }
                          className="cursor-pointer hover:text-red-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── Message Input ─────────────────────────────── */}
                <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] shrink-0 bg-gray-50/30 dark:bg-white/[0.01]">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2.5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="support-attachment"
                    />
                    <label
                      htmlFor="support-attachment"
                      className="h-11 w-11 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:text-[#0F69B0] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.04] transition-all cursor-pointer shrink-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </label>
                    <div className="flex-1">
                      <textarea
                        value={messageText}
                        onChange={(e) =>
                          setMessageText(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey
                          ) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        placeholder="Type your reply..."
                        rows={1}
                        disabled={isSending}
                        className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] transition-all resize-none max-h-32 disabled:opacity-60"
                        style={{ minHeight: "46px" }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        isSending ||
                        (!messageText.trim() &&
                          attachments.length === 0)
                      }
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                      }}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </form>
                  <p className="text-[9px] text-muted-foreground/60 font-medium mt-2 text-center">
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}