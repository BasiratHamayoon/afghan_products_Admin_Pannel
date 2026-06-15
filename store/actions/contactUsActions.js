import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setMessages,
  setPaginationMeta,
  setError,
  updateMessageInList,
  markMessageViewed,
  markMessageReplied,
  archiveMessageInList,
  unarchiveMessageInList,
} from "@/store/slices/contactUsSlice";

export const normalizeMessage = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    name: item.name || item.fullName || "",
    email: item.email || "",
    phone: item.phone || item.phoneNumber || "",
    subject: item.subject || "",
    message: item.message || item.body || "",
    status: item.status || "UNREAD",
    isViewed: item.isViewed ?? false,
    isArchived: item.isArchived ?? false,
    adminReply: item.adminReply || item.reply || "",
    repliedAt: item.repliedAt || null,
    viewedAt: item.viewedAt || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

// ─── Fetch List ───────────────────────────────────────────────────────────────
export const fetchContactMessages = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", status, isArchived } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (status && status !== "all") query.set("status", status);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));

    const res = await axiosInstance.get(`/contact_us?${query.toString()}`);
    const data = res.data;
    const raw = data.contactMessages || data.messages || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeMessage).filter(Boolean) : [];

    dispatch(setMessages(normalized));
    dispatch(setPaginationMeta({
      page: data.page || data.currentPage || page,
      limit: data.limit || limit,
      total: data.total || data.totalCount || normalized.length,
      totalPages: data.totalPages || 1,
    }));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch messages"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Fetch Single ─────────────────────────────────────────────────────────────
export const fetchContactMessageById = (id) => async (dispatch) => {
  if (!id) return { success: false };
  if (_byIdCache[id] && _byIdCache[id] !== "loading") {
    return { success: true, data: _byIdCache[id] };
  }
  if (_byIdCache[id] === "loading") {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (_byIdCache[id] && _byIdCache[id] !== "loading") {
          clearInterval(interval);
          resolve({ success: true, data: _byIdCache[id] });
        }
        if (attempts > 50) {
          clearInterval(interval);
          resolve({ success: false });
        }
      }, 100);
    });
  }
  _byIdCache[id] = "loading";
  try {
    const res = await axiosInstance.get(`/contact_us/${id}`);
    const raw = res.data?.contactMessage || res.data?.message || res.data?.data || res.data;
    const normalized = normalizeMessage(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const clearContactByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

// ─── Update Message ───────────────────────────────────────────────────────────
export const updateContactMessage = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/contact_us/${id}`, payload);
    const raw = res.data?.contactMessage || res.data?.message || res.data?.data || res.data;
    const normalized = normalizeMessage(raw);
    if (normalized) dispatch(updateMessageInList(normalized));
    clearContactByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update" };
  }
};

// ─── Mark Viewed ──────────────────────────────────────────────────────────────
export const markContactMessageViewedAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/contact_us/${id}/viewed`);
    dispatch(markMessageViewed(id));
    clearContactByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to mark as viewed" };
  }
};

// ─── Reply ────────────────────────────────────────────────────────────────────
export const replyToContactMessage = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/contact_us/${id}/reply`, payload);
    const raw = res.data?.contactMessage || res.data?.message || res.data?.data || res.data;
    const normalized = normalizeMessage(raw);
    dispatch(markMessageReplied(id));
    if (normalized) dispatch(updateMessageInList(normalized));
    clearContactByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to send reply" };
  }
};

// ─── Archive ──────────────────────────────────────────────────────────────────
export const archiveContactMessageAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/contact_us/${id}/archive`);
    dispatch(archiveMessageInList(id));
    clearContactByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to archive" };
  }
};

// ─── Unarchive ────────────────────────────────────────────────────────────────
export const unarchiveContactMessageAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/contact_us/${id}/unarchive`);
    dispatch(unarchiveMessageInList(id));
    clearContactByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to unarchive" };
  }
};