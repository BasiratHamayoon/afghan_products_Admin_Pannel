import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setItems,
  setStats,
  setPaginationMeta,
  addItem,
  updateItemInList,
  removeItemFromList,
  setError,
} from "@/store/slices/aboutSlice";

const normalizeAbout = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    headline: item.headline || "",
    subHeadline: item.subHeadline || "",
    description: item.description || "",
    missionTitle: item.missionTitle || "",
    missionText: item.missionText || "",
    metrics: Array.isArray(item.metrics) ? item.metrics : [],
    features: Array.isArray(item.features) ? item.features : [],
    whyChooseUs: Array.isArray(item.whyChooseUs) ? item.whyChooseUs : [],
    ctaText: item.ctaText || "",
    ctaButtonText: item.ctaButtonText || "",
    ctaButtonUrl: item.ctaButtonUrl || "",
    isActive: item.isActive ?? true,
    stats: Array.isArray(item.stats) ? item.stats : [],
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

let _aboutCache = null;
const _byIdCache = {};

// ─── Fetch About (Singleton GET /about) ───────────────────────────────────────
export const fetchAboutItems = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get("/about");
    const data = res.data;
    const raw = data?.about || data?.data || data;
    const normalized = normalizeAbout(raw);

    if (normalized) {
      _aboutCache = normalized;
      dispatch(setItems([normalized]));
      dispatch(
        setPaginationMeta({
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
        })
      );
    } else {
      dispatch(setItems([]));
      dispatch(
        setPaginationMeta({
          page: 1,
          limit: 1,
          total: 0,
          totalPages: 0,
        })
      );
    }
    return { success: true, data: normalized };
  } catch (err) {
    if (err.status === 404) {
      dispatch(setItems([]));
      dispatch(
        setPaginationMeta({
          page: 1,
          limit: 1,
          total: 0,
          totalPages: 0,
        })
      );
      return { success: true, data: null, empty: true };
    }
    dispatch(setError(err.message || "Failed to fetch about content"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Fetch Stats (GET /about/stats) ──────────────────────────────────────────
export const fetchAboutStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/about/stats");
    const data = res.data?.data || res.data?.stats || res.data;
    dispatch(setStats(data));
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Failed to fetch stats",
    };
  } finally {
    dispatch(setStatsLoading(false));
  }
};

// ─── Fetch By ID (GET /about/:id) ─────────────────────────────────────────────
export const fetchAboutById = (id) => async () => {
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
    const res = await axiosInstance.get(`/about/${id}`);
    const raw = res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return {
      success: false,
      message: err.message || "Failed to fetch about item",
    };
  }
};

export const clearAboutByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const clearAboutCache = () => {
  _aboutCache = null;
};

// ─── Create (POST /about) ─────────────────────────────────────────────────────
export const createAboutItem = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/about", payload);
    const raw = res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    if (normalized) {
      dispatch(addItem(normalized));
      clearAboutCache();
    }
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Failed to create about item",
    };
  }
};

// ─── Update (PATCH /about/:id) ────────────────────────────────────────────────
export const updateAboutItem = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/about/${id}`, payload);
    const raw = res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    if (normalized) dispatch(updateItemInList(normalized));
    clearAboutByIdCache(id);
    clearAboutCache();
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Failed to update about item",
    };
  }
};

// ─── Delete (DELETE /about/:id) ───────────────────────────────────────────────
export const deleteAboutItem = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/about/${id}`);
    dispatch(removeItemFromList(id));
    clearAboutByIdCache(id);
    clearAboutCache();
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.message || "Failed to delete about item",
    };
  }
};