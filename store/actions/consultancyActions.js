import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setSessionsLoading,
  setConsultants,
  setPaginationMeta,
  addConsultant,
  updateConsultantInList,
  removeConsultantFromList,
  setSessions,
  updateSessionInList,
  setError,
} from "@/store/slices/consultancySlice";

const BASE = "/consultancy";

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

const normalizeConsultant = (item) => {
  if (!item) return null;

  const nameMultilingual = normalizeMultilingual(item.name);
  const titleMultilingual = normalizeMultilingual(item.title);
  const descriptionMultilingual = normalizeMultilingual(item.description);

  return {
    ...item,
    id: item._id || item.id,
    nameMultilingual,
    titleMultilingual,
    descriptionMultilingual,
    name: getFlatValue(nameMultilingual),
    title: getFlatValue(titleMultilingual),
    description: getFlatValue(descriptionMultilingual),
    specialization: item.specialization || "",
    profileImage: item.profileImage || null,
    hourlyRateMin: item.hourlyRateMin ?? 0,
    hourlyRateMax: item.hourlyRateMax ?? 0,
    rating: item.rating ?? 0,
    totalSessions: item.totalSessions ?? 0,
    languages: Array.isArray(item.languages) ? item.languages : [],
    availability: Array.isArray(item.availability) ? item.availability : [],
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    isDeleted: item.isDeleted ?? false,
    user: item.user || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const normalizeSession = (item) => {
  if (!item) return null;

  const consultantName = (() => {
    const n = item.consultant?.name;
    if (!n) return "";
    if (typeof n === "object") return n.en || n.fa || n.ps || "";
    return typeof n === "string" ? n : "";
  })();

  return {
    id: item._id || item.id,
    consultant: item.consultant || null,
    consultantName,
    user: item.user || null,
    userName: item.user
      ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
      : "",
    userEmail: item.user?.email || "",
    sessionDate: item.sessionDate || null,
    sessionTime: item.sessionTime || "",
    durationHours: item.durationHours ?? 1,
    amount: item.amount ?? 0,
    notes: item.notes || "",
    status: item.status || "pending",
    completedAt: item.completedAt || null,
    isDeleted: item.isDeleted ?? false,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchConsultants = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 20, search = "", specialization } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (specialization) query.set("specialization", specialization);

    const res = await axiosInstance.get(`${BASE}?${query.toString()}`);
    const data = res.data;
    const raw = data.consultants || data.data || data.items || [];
    const pagination = data.pagination || {};
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeConsultant).filter(Boolean)
      : [];

    dispatch(setConsultants(normalized));
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
    dispatch(setError(err.message || "Failed to fetch consultants"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchConsultantById = (id) => async () => {
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
    const raw = res.data?.consultant || res.data?.data || res.data;
    const normalized = normalizeConsultant(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message };
  }
};

export const clearConsultantByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const createConsultant = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.consultant || res.data?.data || res.data;
    const normalized = normalizeConsultant(raw);
    if (normalized) dispatch(addConsultant(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create",
    };
  }
};

export const updateConsultant = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.consultant || res.data?.data || res.data;
    const normalized = normalizeConsultant(raw);
    if (normalized) dispatch(updateConsultantInList(normalized));
    clearConsultantByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const deleteConsultant = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(removeConsultantFromList(id));
    clearConsultantByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};

export const fetchConsultantSessions = (params = {}) => async (dispatch) => {
  dispatch(setSessionsLoading(true));
  try {
    const { status } = params;
    const query = new URLSearchParams();
    if (status && status !== "all") query.set("status", status);

    const res = await axiosInstance.get(
      `${BASE}/consultant-sessions?${query.toString()}`
    );
    const raw = res.data?.sessions || res.data?.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeSession).filter(Boolean)
      : [];
    dispatch(setSessions(normalized));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  } finally {
    dispatch(setSessionsLoading(false));
  }
};

export const updateSessionStatus = (id, status) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(
      `${BASE}/sessions/${id}/status`,
      { status }
    );
    const raw = res.data?.session || res.data?.data || res.data;
    const normalized = normalizeSession(raw);
    if (normalized) dispatch(updateSessionInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update status",
    };
  }
};

export const cancelSession = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/sessions/${id}/cancel`);
    const raw = res.data?.session || res.data?.data || res.data;
    const normalized = normalizeSession(raw);
    if (normalized) dispatch(updateSessionInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to cancel",
    };
  }
};