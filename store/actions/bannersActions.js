import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setBanners,
  setPaginationMeta,
  addBanner,
  updateBannerInList,
  removeBannerFromList,
  setError,
} from "@/store/slices/bannersSlice";

const BASE = "/banners";

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

const normalizeBanner = (item) => {
  if (!item) return null;

  const titleMultilingual = normalizeMultilingual(item.title);
  const subtitleMultilingual = normalizeMultilingual(item.subtitle);

  return {
    ...item,
    id: item._id || item.id,
    titleMultilingual,
    subtitleMultilingual,
    title: getFlatValue(titleMultilingual),
    subtitle: getFlatValue(subtitleMultilingual),
    media: item.media || "",
    mediaType: item.mediaType || "IMAGE",
    position: item.position || "",
    linkType: item.linkType || "none",
    linkValue: item.linkValue || "",
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive ?? true,
    isDeleted: item.isDeleted ?? false,
    startDate: item.startDate || null,
    endDate: item.endDate || null,
    createdBy: item.createdBy || null,
    updatedBy: item.updatedBy || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchBanners = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const {
      page = 1,
      limit = 20,
      position,
      isActive,
      mediaType,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    query.set("sortBy", sortBy);
    query.set("sortOrder", sortOrder);
    if (position) query.set("position", position);
    if (isActive !== undefined) query.set("isActive", String(isActive));
    if (mediaType) query.set("mediaType", mediaType);

    const res = await axiosInstance.get(`${BASE}?${query.toString()}`);
    const data = res.data;
    const raw = data.banners || data.data || data.items || [];
    const pagination = data.pagination || {};
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeBanner).filter(Boolean)
      : [];

    dispatch(setBanners(normalized));
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
    dispatch(setError(err.message || "Failed to fetch banners"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchBannerById = (id) => async () => {
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
    const raw = res.data?.banner || res.data?.data || res.data;
    const normalized = normalizeBanner(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message };
  }
};

export const clearBannerByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const createBanner = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.banner || res.data?.data || res.data;
    const normalized = normalizeBanner(raw);
    if (normalized) dispatch(addBanner(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to create banner" };
  }
};

export const updateBanner = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.banner || res.data?.data || res.data;
    const normalized = normalizeBanner(raw);
    if (normalized) dispatch(updateBannerInList(normalized));
    clearBannerByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update banner" };
  }
};

export const toggleBannerStatus = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}/toggle_status`);
    const raw = res.data?.banner || res.data?.data || res.data;
    const normalized = normalizeBanner(raw);
    if (normalized) dispatch(updateBannerInList(normalized));
    clearBannerByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to toggle status" };
  }
};

export const reorderBanners = (banners) => async (dispatch) => {
  try {
    await axiosInstance.post(`${BASE}/reorder`, { banners });
    dispatch(fetchBanners());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to reorder" };
  }
};

export const deleteBanner = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeBannerFromList(id));
    clearBannerByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete" };
  }
};