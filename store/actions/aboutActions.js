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

const normalizeMetric = (item) => {
  if (!item) return null;
  const labelMultilingual = normalizeMultilingual(item.label);
  const valueMultilingual = normalizeMultilingual(item.value);
  return {
    ...item,
    id: item._id || item.id,
    labelMultilingual,
    valueMultilingual,
    label: getFlatValue(labelMultilingual),
    value: getFlatValue(valueMultilingual),
  };
};

const normalizeFeature = (item) => {
  if (!item) return null;
  const titleMultilingual = normalizeMultilingual(item.title);
  const descriptionMultilingual = normalizeMultilingual(item.description);
  return {
    ...item,
    id: item._id || item.id,
    titleMultilingual,
    descriptionMultilingual,
    title: getFlatValue(titleMultilingual),
    description: getFlatValue(descriptionMultilingual),
    icon: item.icon || null,
  };
};

const normalizeStat = (item) => {
  if (!item) return null;
  const labelMultilingual = normalizeMultilingual(item.label);
  const valueMultilingual = normalizeMultilingual(item.value);
  return {
    ...item,
    id: item._id || item.id,
    labelMultilingual,
    valueMultilingual,
    label: getFlatValue(labelMultilingual),
    value: getFlatValue(valueMultilingual),
    icon: item.icon || null,
    prefix: item.prefix || null,
    suffix: item.suffix || null,
    type: item.type || "static",
    source: item.source || "manual",
    order: item.order ?? 0,
    isActive: item.isActive ?? true,
  };
};

const normalizeAbout = (item) => {
  if (!item) return null;

  const headlineMultilingual = normalizeMultilingual(item.headline);
  const subHeadlineMultilingual = normalizeMultilingual(item.subHeadline);
  const descriptionMultilingual = normalizeMultilingual(item.description);
  const missionTitleMultilingual = normalizeMultilingual(item.missionTitle);
  const missionTextMultilingual = normalizeMultilingual(item.missionText);
  const ctaTextMultilingual = normalizeMultilingual(item.ctaText);
  const ctaButtonTextMultilingual = normalizeMultilingual(item.ctaButtonText);

  return {
    ...item,
    id: item._id || item.id,
    headlineMultilingual,
    subHeadlineMultilingual,
    descriptionMultilingual,
    missionTitleMultilingual,
    missionTextMultilingual,
    ctaTextMultilingual,
    ctaButtonTextMultilingual,
    headline: getFlatValue(headlineMultilingual),
    subHeadline: getFlatValue(subHeadlineMultilingual),
    description: getFlatValue(descriptionMultilingual),
    missionTitle: getFlatValue(missionTitleMultilingual),
    missionText: getFlatValue(missionTextMultilingual),
    ctaText: getFlatValue(ctaTextMultilingual),
    ctaButtonText: getFlatValue(ctaButtonTextMultilingual),
    ctaButtonUrl: item.ctaButtonUrl || "",
    isActive: item.isActive ?? true,
    metrics: Array.isArray(item.metrics)
      ? item.metrics.map(normalizeMetric).filter(Boolean)
      : [],
    features: Array.isArray(item.features)
      ? item.features.map(normalizeFeature).filter(Boolean)
      : [],
    whyChooseUs: Array.isArray(item.whyChooseUs)
      ? item.whyChooseUs.map(normalizeFeature).filter(Boolean)
      : [],
    stats: Array.isArray(item.stats)
      ? item.stats.map(normalizeStat).filter(Boolean)
      : [],
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

let _aboutCache = null;
const _byIdCache = {};

export const fetchAboutItems = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get("/about");
    const data = res.data;
    const raw = data?.data?.about || data?.about || data?.data || data;
    const normalized = normalizeAbout(raw);

    if (normalized) {
      _aboutCache = normalized;
      dispatch(setItems([normalized]));
      dispatch(setPaginationMeta({ page: 1, limit: 1, total: 1, totalPages: 1 }));
    } else {
      dispatch(setItems([]));
      dispatch(setPaginationMeta({ page: 1, limit: 1, total: 0, totalPages: 0 }));
    }
    return { success: true, data: normalized };
  } catch (err) {
    if (err.response?.status === 404) {
      dispatch(setItems([]));
      dispatch(setPaginationMeta({ page: 1, limit: 1, total: 0, totalPages: 0 }));
      return { success: true, data: null, empty: true };
    }
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch about content"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchAboutStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/about/stats");
    const data = res.data?.data || res.data?.stats || res.data;
    dispatch(setStats(data));
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to fetch stats" };
  } finally {
    dispatch(setStatsLoading(false));
  }
};

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
        if (attempts > 50) { clearInterval(interval); resolve({ success: false }); }
      }, 100);
    });
  }

  _byIdCache[id] = "loading";
  try {
    const res = await axiosInstance.get(`/about/${id}`);
    const raw = res.data?.data?.about || res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.response?.data?.message || err.message || "Failed to fetch about item" };
  }
};

export const clearAboutByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const clearAboutCache = () => {
  _aboutCache = null;
};

export const createAboutItem = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/about", payload);
    const raw = res.data?.data?.about || res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    if (normalized) {
      dispatch(addItem(normalized));
      clearAboutCache();
    }
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to create about item" };
  }
};

export const updateAboutItem = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/about/${id}`, payload);
    const raw = res.data?.data?.about || res.data?.about || res.data?.data || res.data;
    const normalized = normalizeAbout(raw);
    if (normalized) dispatch(updateItemInList(normalized));
    clearAboutByIdCache(id);
    clearAboutCache();
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update about item" };
  }
};

export const deleteAboutItem = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/about/${id}`);
    dispatch(removeItemFromList(id));
    clearAboutByIdCache(id);
    clearAboutCache();
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete about item" };
  }
};