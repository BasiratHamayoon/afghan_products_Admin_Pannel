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

const normalizeMultilingual = (raw) => {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      en: typeof raw.en === "string" ? raw.en.trim() : "",
      fa: typeof raw.fa === "string" ? raw.fa.trim() : "",
      ps: typeof raw.ps === "string" ? raw.ps.trim() : "",
    };
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    return { en: raw.trim(), fa: "", ps: "" };
  }
  return { en: "", fa: "", ps: "" };
};

const getFlatValue = (multiObj) =>
  multiObj?.en || multiObj?.fa || multiObj?.ps || "";

const resolveMultilingualRaw = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw.en || raw.fa || raw.ps || "";
  }
  return "";
};

const normalizePartner = (item) => {
  if (!item) return null;

  const titleMultilingual = normalizeMultilingual(item.title);
  const descriptionMultilingual = normalizeMultilingual(item.description);
  const businessCategoryMultilingual = normalizeMultilingual(item.businessCategory);
  const partnershipTypeMultilingual = normalizeMultilingual(item.partnershipType);
  const tagMultilingual = normalizeMultilingual(item.tag);
  const businessNameMultilingual = normalizeMultilingual(item.business?.businessName || item.businessName);

  const cityMultilingual = normalizeMultilingual(item.location?.city || item.city);
  const countryMultilingual = normalizeMultilingual(item.location?.country || item.country);

  return {
    ...item,
    id: item._id || item.id,
    titleMultilingual,
    descriptionMultilingual,
    businessCategoryMultilingual,
    partnershipTypeMultilingual,
    tagMultilingual,
    businessNameMultilingual,
    cityMultilingual,
    countryMultilingual,
    title: getFlatValue(titleMultilingual),
    description: getFlatValue(descriptionMultilingual),
    businessCategory: getFlatValue(businessCategoryMultilingual),
    location: item.location || { city: "", country: "" },
    city: getFlatValue(cityMultilingual),
    country: getFlatValue(countryMultilingual),
    investmentRangeMin: item.investmentRangeMin ?? 0,
    investmentRangeMax: item.investmentRangeMax ?? 0,
    partnershipType: getFlatValue(partnershipTypeMultilingual),
    equityOffered: item.equityOffered || { min: null, max: null },
    logo: item.logo || null,
    tag: getFlatValue(tagMultilingual),
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    isDeleted: item.isDeleted ?? false,
    approvalStatus: (resolveMultilingualRaw(item.approvalStatus) || item.approvalStatus || "pending").toUpperCase(),
    business: item.business || null,
    businessName: getFlatValue(businessNameMultilingual),
    ownerName: item.business?.owner
      ? `${item.business.owner.firstName || ""} ${item.business.owner.lastName || ""}`.trim()
      : item.ownerName || "",
    ownerEmail: item.business?.owner?.email || item.ownerEmail || "",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const normalizeRequest = (item) => {
  if (!item) return null;

  const companyNameMultilingual = normalizeMultilingual(item.companyName);
  const businessCategoryMultilingual = normalizeMultilingual(item.businessCategory);
  const partnershipTypeMultilingual = normalizeMultilingual(item.partnershipType);
  const projectDescriptionMultilingual = normalizeMultilingual(item.projectDescription);
  const adminNoteMultilingual = normalizeMultilingual(item.adminNote);

  const cityMultilingual = normalizeMultilingual(item.location?.city || item.city);
  const countryMultilingual = normalizeMultilingual(item.location?.country || item.country);

  return {
    ...item,
    id: item._id || item.id,
    companyNameMultilingual,
    businessCategoryMultilingual,
    partnershipTypeMultilingual,
    projectDescriptionMultilingual,
    adminNoteMultilingual,
    cityMultilingual,
    countryMultilingual,
    companyName: getFlatValue(companyNameMultilingual),
    businessCategory: getFlatValue(businessCategoryMultilingual),
    location: item.location || { city: "", country: "" },
    city: getFlatValue(cityMultilingual),
    country: getFlatValue(countryMultilingual),
    investmentRange: item.investmentRange || { key: "", min: 0, max: 0 },
    equityOffered: item.equityOffered || { min: 0, max: 0 },
    partnershipType: getFlatValue(partnershipTypeMultilingual),
    projectDescription: getFlatValue(projectDescriptionMultilingual),
    businessPlan: item.businessPlan || null,
    approvalStatus: (resolveMultilingualRaw(item.approvalStatus) || item.approvalStatus || "pending").toUpperCase(),
    adminNote: getFlatValue(adminNoteMultilingual),
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
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch partners"));
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
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};

export const fetchPartnershipRequests = (params = {}) => async (dispatch) => {
  dispatch(setRequestsLoading(true));
  try {
    const { page = 1, limit = 20, status } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (status && status !== "all") query.set("status", status);

    const res = await axiosInstance.get(`${BASE}/requirements?${query.toString()}`);
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
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch requests",
    };
  } finally {
    dispatch(setRequestsLoading(false));
  }
};

// ─── Review Partnership Request with automatic status normalization ─────────
export const reviewPartnershipRequest = (id, rawStatus, adminNote) => async (dispatch) => {
  try {
    const statusStr = String(rawStatus || "").toLowerCase().trim();
    const isApprove = statusStr === "approve" || statusStr === "approved";
    
    // Normalize to standard backend expected statuses
    const statusUpper = isApprove ? "APPROVED" : "REJECTED";
    const statusLower = isApprove ? "approved" : "rejected";

    let res;
    try {
      // First attempt: UPPERCASE status
      res = await axiosInstance.patch(`${BASE}/requirements/${id}/review`, {
        approvalStatus: statusUpper,
        status: statusUpper,
        ...(adminNote !== undefined && { adminNote }),
      });
    } catch (firstErr) {
      // Second attempt: lowercase status if backend uses lowercase enum
      if (firstErr.response?.status === 400 || firstErr.response?.data?.message?.toLowerCase().includes("status")) {
        res = await axiosInstance.patch(`${BASE}/requirements/${id}/review`, {
          approvalStatus: statusLower,
          status: statusLower,
          ...(adminNote !== undefined && { adminNote }),
        });
      } else {
        throw firstErr;
      }
    }

    const raw = res.data?.request || res.data?.data || res.data;
    const normalized = normalizeRequest(raw);
    if (normalized) {
      dispatch(updateRequestInList(normalized));
    } else {
      dispatch(updateRequestInList({ id, approvalStatus: statusUpper }));
    }
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to review request",
    };
  }
};