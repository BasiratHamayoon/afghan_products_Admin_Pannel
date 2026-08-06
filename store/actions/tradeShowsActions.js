import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setTradeShows,
  setPaginationMeta,
  addTradeShow,
  updateTradeShowInList,
  removeTradeShowFromList,
  setError,
} from "@/store/slices/tradeShowsSlice";

const BASE = "/trade_shows";

const normalizeTradeShow = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    title: item.title || "",
    description: item.description || "",
    image: item.image || "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    country: item.country || "",
    city: item.city || "",
    venue: item.venue || "",
    address: item.address || "",
    startDate: item.startDate || null,
    endDate: item.endDate || null,
    organizer: item.organizer || "",
    organizerEmail: item.organizerEmail || "",
    organizerPhone: item.organizerPhone || "",
    website: item.website || "",
    category: item.category || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    isFeatured: item.isFeatured ?? false,
    isActive: item.isActive ?? true,
    bookmarkedBy: Array.isArray(item.bookmarkedBy) ? item.bookmarkedBy : [],
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchTradeShows = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      country,
      city,
      isFeatured,
      isActive,
    } = params;

    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (country) query.set("country", country);
    if (city) query.set("city", city);
    if (isFeatured !== undefined) query.set("isFeatured", String(isFeatured));
    if (isActive !== undefined) query.set("isActive", String(isActive));

    const res = await axiosInstance.get(`${BASE}?${query.toString()}`);
    const data = res.data;
    const raw = data.tradeShows || data.tradeShow || data.data || data.items || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeTradeShow).filter(Boolean)
      : [];

    dispatch(setTradeShows(normalized));
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
    dispatch(setError(err.message || "Failed to fetch trade shows"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchTradeShowById = (id) => async () => {
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
    const raw = res.data?.tradeShow || res.data?.data || res.data;
    const normalized = normalizeTradeShow(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message || "Failed to fetch trade show" };
  }
};

export const clearTradeShowByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const fetchTradeShowCountries = () => async () => {
  try {
    const res = await axiosInstance.get(`${BASE}/countries`);
    const data = res.data?.countries || res.data?.data || res.data || [];
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const fetchTradeShowCities = (country) => async () => {
  try {
    const query = country ? `?country=${country}` : "";
    const res = await axiosInstance.get(`${BASE}/cities${query}`);
    const data = res.data?.cities || res.data?.data || res.data || [];
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const createTradeShow = (payload) => async (dispatch) => {
  try {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.post(BASE, payload, {
      headers: isFormData
        ? { "Content-Type": undefined }
        : { "Content-Type": "application/json" },
    });
    const raw = res.data?.tradeShow || res.data?.data || res.data;
    const normalized = normalizeTradeShow(raw);
    if (normalized) dispatch(addTradeShow(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message || "Failed to create trade show" };
  }
};

export const updateTradeShow = (id, payload) => async (dispatch) => {
  try {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.patch(`${BASE}/${id}`, payload, {
      headers: isFormData
        ? { "Content-Type": undefined }
        : { "Content-Type": "application/json" },
    });
    const raw = res.data?.tradeShow || res.data?.data || res.data;
    const normalized = normalizeTradeShow(raw);
    if (normalized) dispatch(updateTradeShowInList(normalized));
    clearTradeShowByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update trade show" };
  }
};

export const deleteTradeShow = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeTradeShowFromList(id));
    clearTradeShowByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete trade show" };
  }
};