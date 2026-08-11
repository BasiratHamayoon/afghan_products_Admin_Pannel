import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStories,
  setPaginationMeta,
  addStory,
  updateStoryInList,
  removeStoryFromList,
  setError,
} from "@/store/slices/successStoriesSlice";

const BASE = "/success_stories";

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

const normalizeStory = (item) => {
  if (!item) return null;

  const fullNameMultilingual = normalizeMultilingual(item.fullName);
  const companyNameMultilingual = normalizeMultilingual(item.companyName);
  const storyMultilingual = normalizeMultilingual(item.story);
  const locationMultilingual = normalizeMultilingual(item.location);

  return {
    ...item,
    id: item._id || item.id,
    fullNameMultilingual,
    companyNameMultilingual,
    storyMultilingual,
    locationMultilingual,
    fullName: getFlatValue(fullNameMultilingual),
    companyName: getFlatValue(companyNameMultilingual),
    story: getFlatValue(storyMultilingual),
    location: getFlatValue(locationMultilingual),
    profilePicture: item.profilePicture || "",
    rating: item.rating ?? 5,
    storyDate: item.storyDate || null,
    isActive: item.isActive ?? true,
    isDeleted: item.isDeleted ?? false,
    displayOrder: item.displayOrder ?? 0,
    createdBy: item.createdBy || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchSuccessStories = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isActive } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isActive !== undefined) query.set("isActive", String(isActive));

    const res = await axiosInstance.get(`${BASE}/admin/all?${query.toString()}`);
    const data = res.data;

    const raw =
      data.data?.stories ||
      data.stories ||
      data.data ||
      data.items ||
      [];

    const pagination =
      data.data?.pagination ||
      data.pagination ||
      {};

    const normalized = Array.isArray(raw)
      ? raw.map(normalizeStory).filter(Boolean)
      : [];

    dispatch(setStories(normalized));
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
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch success stories"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchSuccessStoryById = (id) => async () => {
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
    const raw =
      res.data?.data?.story ||
      res.data?.story ||
      res.data?.data ||
      res.data;
    const normalized = normalizeStory(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const clearStoryByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const createSuccessStory = (payload) => async (dispatch) => {
  try {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.post(BASE, payload, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    const raw =
      res.data?.data?.successStory ||
      res.data?.successStory ||
      res.data?.data?.story ||
      res.data?.story ||
      res.data?.data ||
      res.data;
    const normalized = normalizeStory(raw);
    if (normalized) dispatch(addStory(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create",
    };
  }
};

export const updateSuccessStory = (id, payload) => async (dispatch) => {
  try {
    const isFormData = payload instanceof FormData;
    const res = await axiosInstance.patch(`${BASE}/${id}`, payload, {
      headers: isFormData
        ? { "Content-Type": "multipart/form-data" }
        : { "Content-Type": "application/json" },
    });
    const raw =
      res.data?.data?.story ||
      res.data?.story ||
      res.data?.data ||
      res.data;
    const normalized = normalizeStory(raw);
    if (normalized) dispatch(updateStoryInList(normalized));
    clearStoryByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const toggleSuccessStoryStatus = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}/toggle-status`);
    const raw =
      res.data?.data?.story ||
      res.data?.story ||
      res.data?.data ||
      res.data;
    const normalized = normalizeStory(raw);
    if (normalized) dispatch(updateStoryInList(normalized));
    clearStoryByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to toggle status",
    };
  }
};

export const deleteSuccessStory = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeStoryFromList(id));
    clearStoryByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};

export const permanentDeleteSuccessStory = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}/permanent`);
    dispatch(removeStoryFromList(id));
    clearStoryByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to permanently delete",
    };
  }
};