import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setInvestments,
  setPaginationMeta,
  updateInvestmentInList,
  removeInvestmentFromList,
  setError,
} from "@/store/slices/investmentsSlice";

const BASE = "/investments";

const normalizeInvestment = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    title: item.title || "",
    slug: item.slug || "",
    description: item.description || "",
    category: item.category || "",
    riskLevel: (item.riskLevel || "medium").toLowerCase(),
    location: item.location || { city: "", country: "" },
    city: item.location?.city || "",
    country: item.location?.country || "",
    requiredAmount: item.requiredAmount ?? 0,
    raisedAmount: item.raisedAmount ?? 0,
    minInvestment: item.minInvestment ?? 0,
    expectedROI: item.expectedROI ?? 0,
    durationMonths: item.durationMonths ?? 0,
    images: Array.isArray(item.images) ? item.images : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    status: (item.status || "pending").toUpperCase(),
    approvalStatus: (item.approvalStatus || "PENDING").toUpperCase(),
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    isDeleted: item.isDeleted ?? false,
    business: item.business || null,
    businessName: item.business?.businessName || "",
    ownerName: item.business?.owner
      ? `${item.business.owner.firstName || ""} ${item.business.owner.lastName || ""}`.trim()
      : "",
    ownerEmail: item.business?.owner?.email || "",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchInvestments = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category,
      riskLevel,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    if (search) query.set("search", search);
    if (category && category !== "all") query.set("category", category);
    if (riskLevel) query.set("riskLevel", riskLevel);
    if (status) query.set("status", status);

    const res = await axiosInstance.get(`${BASE}?${query.toString()}`);
    const data = res.data;
    const raw = data.investments || data.data || data.items || [];
    const pagination = data.pagination || {};
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeInvestment).filter(Boolean)
      : [];

    dispatch(setInvestments(normalized));
    dispatch(
      setPaginationMeta({
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || normalized.length,
        totalPages: pagination.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(setError(err.message || "Failed to fetch investments"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchInvestmentById = (id) => async () => {
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
    const res = await axiosInstance.get(`${BASE}/${id}`);
    const raw = res.data?.investment || res.data?.data || res.data;
    const normalized = normalizeInvestment(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message };
  }
};

export const clearInvestmentByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const fetchInvestmentCategories = () => async () => {
  try {
    const res = await axiosInstance.get(`${BASE}/categories`);
    const data = res.data?.categories || res.data?.data || [];
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const toggleInvestmentApproval = (id, approvalStatus) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}/approve`, {
      approvalStatus: approvalStatus.toUpperCase(),
    });
    const raw = res.data?.investment || res.data?.data || res.data;
    const normalized = normalizeInvestment(raw);
    if (normalized) dispatch(updateInvestmentInList(normalized));
    clearInvestmentByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update approval" };
  }
};

export const deleteInvestment = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeInvestmentFromList(id));
    clearInvestmentByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete" };
  }
};