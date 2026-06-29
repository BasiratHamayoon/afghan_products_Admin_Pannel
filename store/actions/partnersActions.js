import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setRequestsLoading,
  setPartners,
  setPartnersPagination,
  updatePartnerInList,
  removePartnerFromList,
  setPartnershipRequests,
  setRequestsPagination,
  updateRequestInList,
  setError,
} from "@/store/slices/partnersSlice";

const BASE = "/partners";

const normalizePartner = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    title: item.title || "",
    description: item.description || "",
    businessCategory: item.businessCategory || "",
    location: item.location || { city: "", country: "" },
    city: item.location?.city || "",
    country: item.location?.country || "",
    investmentRangeMin: item.investmentRangeMin ?? 0,
    investmentRangeMax: item.investmentRangeMax ?? 0,
    partnershipType: item.partnershipType || "",
    equityOffered: item.equityOffered || { min: null, max: null },
    logo: item.logo || null,
    tag: item.tag || "",
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    isDeleted: item.isDeleted ?? false,
    approvalStatus: (item.approvalStatus || "pending").toUpperCase(),
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

const normalizeRequest = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    companyName: item.companyName || "",
    businessCategory: item.businessCategory || "",
    location: item.location || { city: "", country: "" },
    city: item.location?.city || "",
    country: item.location?.country || "",
    investmentRange: item.investmentRange || { key: "", min: 0, max: 0 },
    equityOffered: item.equityOffered || { min: 0, max: 0 },
    partnershipType: item.partnershipType || "",
    projectDescription: item.projectDescription || "",
    businessPlan: item.businessPlan || null,
    approvalStatus: (item.approvalStatus || "pending").toUpperCase(),
    adminNote: item.adminNote || "",
    user: item.user || null,
    userName: item.user
      ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
      : "",
    userEmail: item.user?.email || "",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchPartners = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      businessCategory,
      partnershipType,
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (businessCategory && businessCategory !== "all")
      query.set("businessCategory", businessCategory);
    if (partnershipType) query.set("partnershipType", partnershipType);

    const res = await axiosInstance.get(`${BASE}?${query.toString()}`);
    const data = res.data;
    const raw = data.partners || data.data || data.items || [];
    const pagination = data.pagination || {};
    const normalized = Array.isArray(raw)
      ? raw.map(normalizePartner).filter(Boolean)
      : [];

    dispatch(setPartners(normalized));
    dispatch(
      setPartnersPagination({
        page: pagination.page || page,
        limit: pagination.limit || limit,
        total: pagination.total || normalized.length,
        totalPages: pagination.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(setError(err.message || "Failed to fetch partners"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchPartnerById = (id) => async () => {
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
    const raw = res.data?.partner || res.data?.data || res.data;
    const normalized = normalizePartner(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message };
  }
};

export const clearPartnerByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const deletePartner = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removePartnerFromList(id));
    clearPartnerByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Failed to delete",
    };
  }
};

export const fetchPartnershipRequests =
  (params = {}) =>
  async (dispatch) => {
    dispatch(setRequestsLoading(true));
    try {
      const { page = 1, limit = 20, status } = params;
      const query = new URLSearchParams();
      query.set("page", String(page));
      query.set("limit", String(limit));
      if (status && status !== "all") query.set("status", status);

      const res = await axiosInstance.get(
        `${BASE}/requirements?${query.toString()}`
      );
      const data = res.data;
      const raw = data.requests || data.data || data.items || [];
      const pagination = data.pagination || {};
      const normalized = Array.isArray(raw)
        ? raw.map(normalizeRequest).filter(Boolean)
        : [];

      dispatch(setPartnershipRequests(normalized));
      dispatch(
        setRequestsPagination({
          page: pagination.page || page,
          limit: pagination.limit || limit,
          total: pagination.total || normalized.length,
          totalPages: pagination.totalPages || 1,
        })
      );
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      dispatch(setRequestsLoading(false));
    }
  };

export const reviewPartnershipRequest =
  (id, approvalStatus, adminNote) => async (dispatch) => {
    try {
      const payload = { approvalStatus: approvalStatus.toLowerCase() };
      if (adminNote !== undefined) payload.adminNote = adminNote;

      const res = await axiosInstance.patch(
        `${BASE}/requirements/${id}/review`,
        payload
      );
      const raw =
        res.data?.request || res.data?.data || res.data;
      const normalized = normalizeRequest(raw);
      if (normalized) dispatch(updateRequestInList(normalized));
      return { success: true, data: normalized };
    } catch (err) {
      return {
        success: false,
        message: err.message || "Failed to review request",
      };
    }
  };