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

const normalizeMultilingualTags = (raw) => {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      en: Array.isArray(raw.en) ? raw.en : [],
      fa: Array.isArray(raw.fa) ? raw.fa : [],
      ps: Array.isArray(raw.ps) ? raw.ps : [],
    };
  }
  if (Array.isArray(raw)) {
    return { en: raw, fa: [], ps: [] };
  }
  return { en: [], fa: [], ps: [] };
};

const normalizeTradeShow = (item) => {
  if (!item) return null;

  const titleMultilingual = normalizeMultilingual(item.title);
  const descriptionMultilingual = normalizeMultilingual(item.description);
  const countryMultilingual = normalizeMultilingual(item.country);
  const cityMultilingual = normalizeMultilingual(item.city);
  const venueMultilingual = normalizeMultilingual(item.venue);
  const addressMultilingual = normalizeMultilingual(item.address);
  const organizerMultilingual = normalizeMultilingual(item.organizer);
  const categoryMultilingual = normalizeMultilingual(item.category);
  const tagsMultilingual = normalizeMultilingualTags(item.tags);

  return {
    ...item,
    id: item._id || item.id,
    titleMultilingual,
    descriptionMultilingual,
    countryMultilingual,
    cityMultilingual,
    venueMultilingual,
    addressMultilingual,
    organizerMultilingual,
    categoryMultilingual,
    tagsMultilingual,
    title: getFlatValue(titleMultilingual),
    description: getFlatValue(descriptionMultilingual),
    country: getFlatValue(countryMultilingual),
    city: getFlatValue(cityMultilingual),
    venue: getFlatValue(venueMultilingual),
    address: getFlatValue(addressMultilingual),
    organizer: getFlatValue(organizerMultilingual),
    category: getFlatValue(categoryMultilingual),
    tags: tagsMultilingual.en || tagsMultilingual.fa || tagsMultilingual.ps || [],
    image: item.image || "",
    gallery: Array.isArray(item.gallery) ? item.gallery : [],
    startDate: item.startDate || null,
    endDate: item.endDate || null,
    organizerEmail: item.organizerEmail || "",
    organizerPhone: item.organizerPhone || "",
    website: item.website || "",
    isFeatured: item.isFeatured ?? false,
    isActive: item.isActive ?? true,
    isBookmarked: item.isBookmarked ?? false,
    bookmarkCount: item.bookmarkCount ?? 0,
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
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create trade show",
    };
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
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update trade show",
    };
  }
};

export const deleteTradeShow = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeTradeShowFromList(id));
    clearTradeShowByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete trade show",
    };
  }
};