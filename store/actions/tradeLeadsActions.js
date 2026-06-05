import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setDetailLoading,
  setTradeLeads,
  setPaginationMeta,
  addTradeLead,
  updateTradeLeadInList,
  removeTradeLeadFromList,
  setSelectedLead,
  setError,
  setUnlockRequests,
  setUnlockRequestsLoading,
  setUnlockPaginationMeta,
  setSelectedUnlockRequest,
  updateUnlockRequestInList,
} from "@/store/slices/tradeLeadsSlice";

const normalizeLead = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    productId: item.product?._id || item.product?.id || item.product,
    productName: item.product?.name || "",
    productSlug: item.product?.slug || "",
    categoryId: item.category?._id || item.category?.id || item.category,
    categoryName: item.category?.name || "",
    quantity: item.quantity || 0,
    unit: item.unit || "",
    minBudget: item.budgetRange?.min ?? item.minBudget ?? 0,
    maxBudget: item.budgetRange?.max ?? item.maxBudget ?? 0,
    location: item.location || "",
    urgency: item.urgency || "LOW",
    detailDescription: item.detailDescription || "",
    attachment: item.attachment || null,
    status: item.status || "PENDING",
    createdByName:
      item.postedBy?.fullName ||
      (item.userId
        ? `${item.userId.firstName || ""} ${item.userId.lastName || ""}`.trim()
        : ""),
    createdByEmail: item.postedBy?.email || item.userId?.email || "",
    createdByImage: item.postedBy?.image || null,
    createdById: item.userId?._id || item.userId?.id || item.userId,
    requestedUnlockCount: item.requestedUnlockCount || 0,
    unlockedCount: item.unlockedCount || 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const normalizeUnlockRequest = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    tradeLeadId: item.tradeLead?._id || item.tradeLead?.id || item.tradeLead || "",
    tradeLeadProduct: item.tradeLead?.product?.name || "",
    tradeLeadLocation: item.tradeLead?.location || "",
    tradeLeadUrgency: item.tradeLead?.urgency || "",
    sellerId: item.seller?._id || item.seller?.id || item.seller || "",
    sellerName: item.seller
      ? `${item.seller.firstName || ""} ${item.seller.lastName || ""}`.trim()
      : item.sellerName || "",
    sellerEmail: item.seller?.email || item.sellerEmail || "",
    sellerImage: item.seller?.image || null,
    status: item.status || "PENDING",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

export const fetchTradeLeads = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", status, urgency } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (status && status !== "all") query.set("status", status);
    if (urgency && urgency !== "all") query.set("urgency", urgency);

    const res = await axiosInstance.get(`/trade_lead?${query.toString()}`);
    const data = res.data;
    const raw = data.tradeLeads || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeLead).filter(Boolean) : [];

    dispatch(setTradeLeads(normalized));
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
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch trade leads"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchTradeLeadById = (id) => async (dispatch) => {
  dispatch(setDetailLoading(true));
  try {
    const res = await axiosInstance.get(`/trade_lead/${id}`);
    const raw = res.data?.tradeLead || res.data?.data || res.data;
    const normalized = normalizeLead(raw);
    dispatch(setSelectedLead(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch trade lead"));
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setDetailLoading(false));
  }
};

export const createTradeLead = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/trade_lead", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.tradeLead || res.data?.data || res.data;
    const created = normalizeLead(raw);
    if (created) dispatch(addTradeLead(created));
    return { success: true, data: created };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to create" };
  }
};

export const editTradeLead = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/trade_lead/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.tradeLead || res.data?.data || res.data;
    const updated = normalizeLead(raw);
    if (updated) {
      dispatch(updateTradeLeadInList(updated));
      dispatch(setSelectedLead(updated));
    }
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update" };
  }
};

export const updateTradeLeadStatus = (id, status) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/trade_lead/${id}/status`, { status });
    const raw = res.data?.tradeLead || res.data?.data || res.data;
    if (raw && typeof raw === "object" && (raw._id || raw.id)) {
      const normalized = normalizeLead(raw);
      if (normalized) dispatch(updateTradeLeadInList(normalized));
    } else {
      dispatch(updateTradeLeadInList({ id, status }));
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update status" };
  }
};

export const removeTradeLead = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/trade_lead/${id}`);
    dispatch(removeTradeLeadFromList(id));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete" };
  }
};

export const requestUnlockTradeLead = (id) => async () => {
  try {
    const res = await axiosInstance.post(`/trade_lead/${id}/unlock`);
    return { success: true, data: res.data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to request unlock" };
  }
};

export const fetchUnlockRequests = (params = {}) => async (dispatch) => {
  dispatch(setUnlockRequestsLoading(true));
  try {
    const { page = 1, limit = 10, status } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (status && status !== "all") query.set("status", status);

    const res = await axiosInstance.get(`/trade_lead/unlock-requests?${query.toString()}`);
    const data = res.data;
    const raw = data.unlockRequests || data.requests || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeUnlockRequest).filter(Boolean) : [];

    dispatch(setUnlockRequests(normalized));
    dispatch(
      setUnlockPaginationMeta({
        page: data.page || data.currentPage || page,
        limit: data.limit || limit,
        total: data.total || data.totalCount || normalized.length,
        totalPages: data.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to fetch requests" };
  } finally {
    dispatch(setUnlockRequestsLoading(false));
  }
};

export const respondToUnlockRequest = (requestId, status) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/trade_lead/unlock-request/${requestId}`, { status });
    const raw = res.data?.unlockRequest || res.data?.request || res.data?.data;
    if (raw && typeof raw === "object") {
      dispatch(updateUnlockRequestInList(normalizeUnlockRequest(raw)));
    } else {
      dispatch(updateUnlockRequestInList({ id: requestId, status }));
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to respond" };
  }
};