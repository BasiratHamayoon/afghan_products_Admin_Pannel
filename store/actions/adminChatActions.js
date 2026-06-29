import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setMessagesLoading,
  setConversations,
  setConversationsPagination,
  setActiveConversation,
  setMessages,
  appendMessages,
  setMessagesPagination,
  setUnreadCount,
  markConversationRead,
  updateConversationLastMessage,
  removeConversation,
  removeMessage,
  addNewMessage,
  setError,
} from "@/store/slices/adminChatSlice";

const BASE = "/admin_chat";

const normalizeConversation = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    type: item.type || "support",
    user: item.user || null,
    userName: item.user
      ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
      : "",
    userAvatar: item.user?.profilePicture || null,
    userRole: item.user?.role || "",
    userOnline: item.user?.isOnline ?? false,
    isAdminJoined: item.isAdminJoined ?? false,
    lastMessage: item.lastMessage || null,
    lastMessageAt: item.lastMessageAt || null,
    unreadCount: item.unreadCount ?? 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const normalizeMessage = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    conversation: item.conversation || "",
    sender: item.sender || null,
    senderId: item.sender?._id || item.sender?.id || "",
    senderName: item.sender
      ? `${item.sender.firstName || ""} ${item.sender.lastName || ""}`.trim()
      : "",
    senderAvatar: item.sender?.profilePicture || null,
    senderRole: item.sender?.role || "",
    content: item.content || "",
    type: item.type || "text",
    attachments: Array.isArray(item.attachments) ? item.attachments : [],
    status: item.status || "sent",
    readBy: Array.isArray(item.readBy) ? item.readBy : [],
    isDeleted: item.isDeleted ?? false,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

// ─── GET all support conversations (admin-only endpoint) ──────────────────────
export const fetchAdminSupportConversations =
  (params = {}) =>
  async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const { page = 1, limit = 20, search = "" } = params;
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", String(limit));
      if (search) query.set("search", search);

      const res = await axiosInstance.get(
        `${BASE}/support/conversations?${query.toString()}`
      );
      const data = res.data;
      const raw = data.conversations || data.data || [];
      const pagination = data.pagination || {};
      const normalized = Array.isArray(raw)
        ? raw.map(normalizeConversation).filter(Boolean)
        : [];

      dispatch(setConversations(normalized));
      dispatch(
        setConversationsPagination({
          page: pagination.page || page,
          limit: pagination.limit || limit,
          total: pagination.total || normalized.length,
          totalPages: pagination.totalPages || 1,
        })
      );
      return { success: true };
    } catch (err) {
      dispatch(
        setError(err.message || "Failed to fetch conversations")
      );
      return { success: false, message: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

// ─── GET messages of any support conversation ─────────────────────────────────
export const fetchAdminSupportMessages =
  (conversationId, page = 1) =>
  async (dispatch) => {
    if (!conversationId) return { success: false };
    dispatch(setMessagesLoading(true));
    try {
      const res = await axiosInstance.get(
        `${BASE}/support/conversations/${conversationId}/messages?page=${page}&limit=30`
      );
      const data = res.data;
      const raw = data.messages || data.data || [];
      const pagination = data.pagination || {};
      const normalized = Array.isArray(raw)
        ? raw.map(normalizeMessage).filter(Boolean)
        : [];

      if (page === 1) {
        dispatch(setMessages(normalized));
      } else {
        dispatch(appendMessages(normalized));
      }

      dispatch(
        setMessagesPagination({
          page: pagination.page || page,
          limit: pagination.limit || 30,
          total: pagination.total || normalized.length,
          totalPages: pagination.totalPages || 1,
        })
      );
      dispatch(markConversationRead(conversationId));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      dispatch(setMessagesLoading(false));
    }
  };

// ─── POST join a support conversation ────────────────────────────────────────
export const joinSupportConversation =
  (conversationId) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `${BASE}/support/conversations/${conversationId}/join`
      );
      const raw =
        res.data?.conversation || res.data?.data || res.data;
      return { success: true, data: raw };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to join",
      };
    }
  };

// ─── POST reply to support conversation (admin) ───────────────────────────────
export const adminReplyToSupport =
  (conversationId, content, files = []) =>
  async (dispatch) => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      files.forEach((file) =>
        formData.append("attachments", file)
      );

      const res = await axiosInstance.post(
        `${BASE}/support/conversations/${conversationId}/reply`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const raw =
        res.data?.message || res.data?.data || res.data;
      const normalized = normalizeMessage(raw);

      if (normalized) {
        dispatch(addNewMessage(normalized));
        dispatch(
          updateConversationLastMessage({
            conversationId,
            message: normalized,
          })
        );
      }
      return { success: true, data: normalized };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to send reply",
      };
    }
  };

// ─── GET unread count (uses regular chat endpoint) ────────────────────────────
export const fetchUnreadCount = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/chat/unread_count");
    const count = res.data?.totalUnread ?? 0;
    dispatch(setUnreadCount(count));
    return { success: true, data: count };
  } catch (err) {
    return { success: false, message: err.message };
  }
};