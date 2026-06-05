import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setMessages,
  setPaginationMeta,
  setError,
} from "@/store/slices/contactUsSlice";

const normalizeMessage = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    name: item.name || item.fullName || "",
    email: item.email || "",
    phone: item.phone || item.phoneNumber || "",
    subject: item.subject || "",
    message: item.message || item.body || "",
    status: item.status || "UNREAD",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

export const fetchContactMessages = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", status } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (status && status !== "all") query.set("status", status);

    const res = await axiosInstance.get(`/contact_us?${query.toString()}`);
    const data = res.data;
    const raw = data.contactMessages || data.messages || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeMessage).filter(Boolean)
      : [];

    dispatch(setMessages(normalized));
    dispatch(
      setPaginationMeta({
        page: data.page || data.currentPage || page,
        limit: data.limit || limit,
        total: data.total || data.totalCount || normalized.length,
        totalPages: data.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch messages")
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchContactMessageById = (id) => async (dispatch) => {
  if (!id) return { success: false };
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(`/contact_us/${id}`);
    const raw = res.data?.contactMessage || res.data?.message || res.data?.data || res.data;
    const normalized = normalizeMessage(raw);
    return { success: true, data: normalized };
  } catch (err) {
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch message")
    );
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setLoading(false));
  }
};