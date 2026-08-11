import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setSections,
  setPaginationMeta,
  addSection,
  updateSectionInList,
  archiveSectionInList,
  unarchiveSectionInList,
  updateSectionProducts,
  deleteSection,
  setSelectedSection,
  setError,
} from "@/store/slices/sectionsSlice";

const normalizeSection = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    key: item.key || item.slug || "",
    name: typeof item.name === "string" ? item.name : "",
    description: typeof item.description === "string" ? item.description : "",
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    productsCount: item.productsCount ?? item.products?.length ?? 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

let _listFetchInProgress = false;
const _byKeyCache = {};

export const fetchSections = (params = {}) => async (dispatch) => {
  if (_listFetchInProgress) return;
  _listFetchInProgress = true;
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isArchived } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));
    else query.set("includeArchived", "true");

    const res = await axiosInstance.get(`/home_sections?${query.toString()}`);
    const data = res.data;
    const raw = data.sections || data.homeSections || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeSection).filter(Boolean)
      : [];

    dispatch(setSections(normalized));
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
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch sections")
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
    _listFetchInProgress = false;
  }
};

export const fetchSectionByKey = (key) => async (dispatch) => {
  if (!key) return { success: false };

  if (_byKeyCache[key] && _byKeyCache[key] !== "loading") {
    dispatch(setSelectedSection(_byKeyCache[key]));
    return { success: true, data: _byKeyCache[key] };
  }

  if (_byKeyCache[key] === "loading") {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (_byKeyCache[key] && _byKeyCache[key] !== "loading") {
          clearInterval(interval);
          dispatch(setSelectedSection(_byKeyCache[key]));
          resolve({ success: true, data: _byKeyCache[key] });
        }
        if (attempts > 50) {
          clearInterval(interval);
          resolve({ success: false });
        }
      }, 100);
    });
  }

  _byKeyCache[key] = "loading";
  dispatch(setLoading(true));

  try {
    const res = await axiosInstance.get(`/home_sections/slug/${key}`);
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    const normalized = normalizeSection(raw);
    _byKeyCache[key] = normalized;
    dispatch(setSelectedSection(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    delete _byKeyCache[key];
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch section")
    );
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  } finally {
    dispatch(setLoading(false));
  }
};

export const clearSectionKeyCache = (key) => {
  if (key && _byKeyCache[key]) delete _byKeyCache[key];
};

export const createSection = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/home_sections", data);
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    const created = normalizeSection(raw);
    dispatch(addSection(created));
    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create",
    };
  }
};

export const editSection = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/home_sections/${id}`, data);
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    const updated = normalizeSection(raw);
    dispatch(updateSectionInList(updated));
    dispatch(setSelectedSection(updated));
    if (updated?.key) clearSectionKeyCache(updated.key);
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const manageSectionProducts = (id, productIds) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/home_sections/${id}/products`, {
      products: productIds,
    });
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    const updated = normalizeSection(raw);
    dispatch(
      updateSectionProducts({
        id,
        products: updated?.products || productIds,
      })
    );
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update products",
    };
  }
};

export const archiveSectionAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/home_sections/${id}/archive`);
    dispatch(archiveSectionInList(id));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to archive",
    };
  }
};

export const unarchiveSectionAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/home_sections/${id}/unarchive`);
    dispatch(unarchiveSectionInList(id));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to unarchive",
    };
  }
};

export const deleteSectionAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/home_sections/${id}`);
    dispatch(deleteSection(id));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};