import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setDetailLoading,
  setBusinesses,
  setPendingSellers,
  setVerifiedSellers,
  setPaginationMeta,
  updateBusinessInList,
  removeBusinessFromList,
  setSelectedBusiness,
  setError,
} from "@/store/slices/businessesSlice";

const resolveMultilingual = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw.en || raw.fa || raw.ps || "";
  }
  return "";
};

const resolveDate = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object" && !Array.isArray(val)) {
    return val.gregorian || val.display || val.hijri || null;
  }
  return null;
};

const resolveScalar = (val) => {
  if (!val && val !== 0) return null;
  if (typeof val === "string" || typeof val === "number") return val;
  if (typeof val === "object" && !Array.isArray(val)) {
    return val.gregorian || val.display || val.hijri || val.en || val.fa || val.ps || String(val) || null;
  }
  return null;
};

const normalizeBusiness = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    ownerName: item.owner
      ? `${item.owner.firstName || ""} ${item.owner.lastName || ""}`.trim()
      : item.ownerName || item.userName || "Unknown",
    ownerEmail: item.owner?.email || item.ownerEmail || item.userEmail || "",
    ownerId: item.owner?._id || item.owner?.id || item.userId || null,
    businessName: resolveMultilingual(item.businessName) || "",
    tin: item.tin || "",
    ownershipType: resolveMultilingual(item.ownershipType) || resolveScalar(item.ownershipType) || "",
    description: resolveMultilingual(item.description) || "",
    yearOfEstablishment: resolveScalar(item.yearOfEstablishment) || null,
    verificationStatus: item.verificationStatus || "UNVERIFIED",
    averageRating: resolveScalar(item.averageRating) || 0,
    isDocumentUploaded: item.isDocumentUploaded || false,
    logo: item.logo || null,
    tradeLicense: item.tradeLicense || null,
    nationalIdOrPassport: item.nationalIdOrPassport || null,
    taxCertificate: item.taxCertificate || null,
    createdAt: resolveDate(item.createdAt),
    updatedAt: resolveDate(item.updatedAt),
    verifiedAt: resolveDate(item.verifiedAt),
    rejectedAt: resolveDate(item.rejectedAt),
  };
};

export const fetchBusinesses = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "" } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);

    const res = await axiosInstance.get(`/businesses?${query.toString()}`);
    const data = res.data;
    const raw = data.businesses || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeBusiness).filter(Boolean)
      : [];

    dispatch(setBusinesses(normalized));
    dispatch(
      setPaginationMeta({
        page: data.pagination?.page || data.page || data.currentPage || page,
        limit: data.pagination?.limit || data.limit || limit,
        total: data.pagination?.total || data.total || data.totalCount || normalized.length,
        totalPages: data.pagination?.totalPages || data.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch businesses"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchPendingSellers = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get("/businesses/pendingSellers");
    const data = res.data;
    const raw = data.businesses || data.sellers || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeBusiness).filter(Boolean)
      : [];
    dispatch(setPendingSellers(normalized));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch pending sellers"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchVerifiedSellers = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get("/businesses/verifiedSellers");
    const data = res.data;
    const raw = data.businesses || data.sellers || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeBusiness).filter(Boolean)
      : [];
    dispatch(setVerifiedSellers(normalized));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch verified sellers"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchBusinessById = (id) => async (dispatch) => {
  dispatch(setDetailLoading(true));
  try {
    const res = await axiosInstance.get(`/businesses/${id}`);
    const raw = res.data?.data || res.data?.business || res.data;
    const normalized = normalizeBusiness(raw);
    dispatch(setSelectedBusiness(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch business"));
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setDetailLoading(false));
  }
};

export const createBusiness = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/businesses", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.data || res.data?.business || res.data;
    const normalized = normalizeBusiness(raw);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create business",
    };
  }
};

export const updateVerificationStatus = (id, action) => async (dispatch) => {
  try {
    const statusMap = {
      approve: "VERIFIED",
      reject: "REJECTED",
      pending: "PENDING",
      unverified: "UNVERIFIED",
    };
    const verificationStatus = statusMap[action] || action;

    const res = await axiosInstance.patch(`/businesses/${id}/verify`, {
      verificationStatus,
    });
    const raw = res.data?.data || res.data?.business || res.data;
    const updated = normalizeBusiness(raw) || { id, verificationStatus };
    dispatch(updateBusinessInList(updated));
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update verification status",
    };
  }
};

export const deleteBusinessAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/businesses/${id}`);
    dispatch(removeBusinessFromList(id));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete business",
    };
  }
};