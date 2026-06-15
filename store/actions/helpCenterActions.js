import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setHelpCenter,
  setFaqs,
  addFaq as addFaqToList,
  updateFaqInList,
  removeFaqFromList,
  setCategories,
  addCategory as addCatToList,
  updateCategoryInList,
  removeCategoryFromList,
  setContactOptions,
  addContactOption as addContactToList,
  updateContactOptionInList,
  removeContactOptionFromList,
  setError,
} from "@/store/slices/helpCenterSlice";

const BASE = "/help_center";

const normalizeHelpCenter = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    headerTitle: item.headerTitle || "",
    headerSubtitle: item.headerSubtitle || "",
    heroTitle: item.heroTitle || "",
    heroDescription: item.heroDescription || "",
    heroImage: item.heroImage || "",
    supportTitle: item.supportTitle || "",
    supportDescription: item.supportDescription || "",
    isActive: item.isActive ?? true,
    faqs: Array.isArray(item.faqs) ? item.faqs : [],
    categories: Array.isArray(item.categories) ? item.categories : [],
    contactOptions: Array.isArray(item.contactOptions) ? item.contactOptions : [],
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

// ─── Fetch Help Center (singleton) ────────────────────────────────────────────
export const fetchHelpCenter = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(BASE);
    const raw = res.data?.helpCenter || res.data?.data || res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    if (err.status === 404) {
      dispatch(setHelpCenter(null));
      return { success: true, data: null, empty: true };
    }
    dispatch(setError(err.message || "Failed to fetch help center"));
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

// ─── Fetch By ID ──────────────────────────────────────────────────────────────
export const fetchHelpCenterById = (id) => async () => {
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
    const res = await axiosInstance.get(`${BASE}/${id}`);
    const raw = res.data?.helpCenter || res.data?.data || res.data;
    const normalized = normalizeHelpCenter(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return { success: false, message: err.message };
  }
};

export const clearHelpCenterByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

// ─── Create Help Center ──────────────────────────────────────────────────────
export const createHelpCenter = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(BASE, payload);
    const raw = res.data?.helpCenter || res.data?.data || res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message || "Failed to create" };
  }
};

// ─── Update Help Center ──────────────────────────────────────────────────────
export const updateHelpCenter = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}`, payload);
    const raw = res.data?.helpCenter || res.data?.data || res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    clearHelpCenterByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update" };
  }
};

// ─── Delete Help Center ──────────────────────────────────────────────────────
export const deleteHelpCenter = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(setHelpCenter(null));
    clearHelpCenterByIdCache(id);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete" };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// FAQs
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchFaqs = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/faqs`);
    const data = res.data?.faqs || res.data?.data || [];
    dispatch(setFaqs(Array.isArray(data) ? data : []));
    return { success: true, data };
  } catch (err) {
    if (err.status === 404) { dispatch(setFaqs([])); return { success: true, data: [] }; }
    return { success: false, message: err.message };
  }
};

export const addFaq = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`${BASE}/faqs`, payload);
    const raw = res.data?.helpCenter || res.data;
    // After add, refresh full help center to get updated faqs
    dispatch(fetchHelpCenter());
    return { success: true, data: raw };
  } catch (err) {
    return { success: false, message: err.message || "Failed to add FAQ" };
  }
};

export const updateFaq = (faqId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/faqs/${faqId}`, payload);
    const raw = res.data?.faq || res.data?.data || res.data;
    dispatch(updateFaqInList(raw));
    return { success: true, data: raw };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update FAQ" };
  }
};

export const deleteFaq = (faqId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/faqs/${faqId}`);
    dispatch(removeFaqFromList(faqId));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete FAQ" };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Categories
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchHelpCategories = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/categories`);
    const data = res.data?.categories || res.data?.data || [];
    dispatch(setCategories(Array.isArray(data) ? data : []));
    return { success: true, data };
  } catch (err) {
    if (err.status === 404) { dispatch(setCategories([])); return { success: true, data: [] }; }
    return { success: false, message: err.message };
  }
};

export const addHelpCategory = (payload) => async (dispatch) => {
  try {
    await axiosInstance.post(`${BASE}/categories`, payload);
    dispatch(fetchHelpCenter());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to add category" };
  }
};

export const updateHelpCategory = (catId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/categories/${catId}`, payload);
    const raw = res.data?.category || res.data?.data || res.data;
    dispatch(updateCategoryInList(raw));
    return { success: true, data: raw };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update category" };
  }
};

export const deleteHelpCategory = (catId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/categories/${catId}`);
    dispatch(removeCategoryFromList(catId));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete category" };
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Contact Options
// ═══════════════════════════════════════════════════════════════════════════════

export const fetchContactOptions = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/contact-options`);
    const data = res.data?.contactOptions || res.data?.data || [];
    dispatch(setContactOptions(Array.isArray(data) ? data : []));
    return { success: true, data };
  } catch (err) {
    if (err.status === 404) { dispatch(setContactOptions([])); return { success: true, data: [] }; }
    return { success: false, message: err.message };
  }
};

export const addContactOption = (payload) => async (dispatch) => {
  try {
    await axiosInstance.post(`${BASE}/contact-options`, payload);
    dispatch(fetchHelpCenter());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to add contact option" };
  }
};

export const updateContactOption = (contactId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/contact-options/${contactId}`, payload);
    const raw = res.data?.contact || res.data?.data || res.data;
    dispatch(updateContactOptionInList(raw));
    return { success: true, data: raw };
  } catch (err) {
    return { success: false, message: err.message || "Failed to update contact option" };
  }
};

export const deleteContactOption = (contactId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/contact-options/${contactId}`);
    dispatch(removeContactOptionFromList(contactId));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || "Failed to delete contact option" };
  }
};