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

const normalizeSection = (item) => {
  if (!item) return null;

  const nameMultilingual = normalizeMultilingual(item.name);
  const descriptionMultilingual = normalizeMultilingual(item.description);

  return {
    ...item,
    id: item._id || item.id,
    key: item.key || item.slug || "",
    nameMultilingual,
    descriptionMultilingual,
    name: getFlatValue(nameMultilingual),
    description: getFlatValue(descriptionMultilingual),
    sortOrder: item.sortOrder ?? 0,
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    productsCount: item.productsCount ?? item.products?.length ?? 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const buildPayloadFromForm = (data) => {
  if (!data || typeof data !== "object") return data;

  const langs = ["en", "fa", "ps"];
  const payload = {};

  const nameObj = {};
  langs.forEach((l) => {
    if (data[`name[${l}]`]?.trim()) {
      nameObj[l] = data[`name[${l}]`].trim();
    }
  });

  const descObj = {};
  langs.forEach((l) => {
    if (data[`description[${l}]`]?.trim()) {
      descObj[l] = data[`description[${l}]`].trim();
    }
  });

  if (Object.keys(nameObj).length > 0) {
    payload.name = nameObj;
  } else if (typeof data.name === "string" && data.name.trim()) {
    payload.name = data.name.trim();
  }

  if (Object.keys(descObj).length > 0) {
    payload.description = descObj;
  } else if (typeof data.description === "string" && data.description.trim()) {
    payload.description = data.description.trim();
  }

  if (data.sortOrder !== undefined) payload.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) payload.isActive = data.isActive;
  if (data.isArchived !== undefined) payload.isArchived = data.isArchived;
  if (data.key !== undefined) payload.key = data.key;

  return payload;
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

    if (isArchived === true) {
      query.set("includeArchived", "true");
    } else if (isArchived === false) {
      query.set("includeArchived", "false");
    } else {
      query.set("includeArchived", "true");
    }

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
    const payload = buildPayloadFromForm(data);
    const res = await axiosInstance.post("/home_sections", payload);
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
    const payload = buildPayloadFromForm(data);
    const res = await axiosInstance.patch(`/home_sections/${id}`, payload);
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
    const res = await axiosInstance.patch(`/home_sections/${id}/archive`);
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    if (raw && (raw._id || raw.id)) {
      dispatch(updateSectionInList(normalizeSection(raw)));
    } else {
      dispatch(archiveSectionInList(id));
    }
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
    const res = await axiosInstance.patch(`/home_sections/${id}/unarchive`);
    const raw =
      res.data?.homeSection ||
      res.data?.section ||
      res.data?.data ||
      res.data;
    if (raw && (raw._id || raw.id)) {
      dispatch(updateSectionInList(normalizeSection(raw)));
    } else {
      dispatch(unarchiveSectionInList(id));
    }
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