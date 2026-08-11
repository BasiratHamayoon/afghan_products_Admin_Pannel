import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setHelpCenter,
  setFaqs,
  updateFaqInList,
  removeFaqFromList,
  setCategories,
  updateCategoryInList,
  removeCategoryFromList,
  setContactOptions,
  updateContactOptionInList,
  removeContactOptionFromList,
  setError,
} from "@/store/slices/helpCenterSlice";

const BASE = "/help_center";

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

const normalizeCategory = (item) => {
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
    link: item.link || null,
    order: item.order ?? 0,
    isActive: item.isActive ?? true,
  };
};

const normalizeFaq = (item) => {
  if (!item) return null;
  const questionMultilingual = normalizeMultilingual(item.question);
  const answerMultilingual = normalizeMultilingual(item.answer);
  return {
    ...item,
    id: item._id || item.id,
    questionMultilingual,
    answerMultilingual,
    question: getFlatValue(questionMultilingual),
    answer: getFlatValue(answerMultilingual),
    order: item.order ?? 0,
    isActive: item.isActive ?? true,
  };
};

const normalizeContactOption = (item) => {
  if (!item) return null;
  const labelMultilingual = normalizeMultilingual(item.label);
  return {
    ...item,
    id: item._id || item.id,
    labelMultilingual,
    label: getFlatValue(labelMultilingual),
    type: item.type || "",
    value: item.value || "",
    icon: item.icon || null,
    order: item.order ?? 0,
    isActive: item.isActive ?? true,
  };
};

const normalizeHelpCenter = (item) => {
  if (!item) return null;

  const headerTitleMultilingual = normalizeMultilingual(item.headerTitle);
  const headerSubtitleMultilingual = normalizeMultilingual(item.headerSubtitle);
  const heroTitleMultilingual = normalizeMultilingual(item.heroTitle);
  const heroDescriptionMultilingual = normalizeMultilingual(item.heroDescription);
  const supportTitleMultilingual = normalizeMultilingual(item.supportTitle);
  const supportDescriptionMultilingual = normalizeMultilingual(item.supportDescription);

  return {
    ...item,
    id: item._id || item.id,
    headerTitleMultilingual,
    headerSubtitleMultilingual,
    heroTitleMultilingual,
    heroDescriptionMultilingual,
    supportTitleMultilingual,
    supportDescriptionMultilingual,
    headerTitle: getFlatValue(headerTitleMultilingual),
    headerSubtitle: getFlatValue(headerSubtitleMultilingual),
    heroTitle: getFlatValue(heroTitleMultilingual),
    heroDescription: getFlatValue(heroDescriptionMultilingual),
    supportTitle: getFlatValue(supportTitleMultilingual),
    supportDescription: getFlatValue(supportDescriptionMultilingual),
    heroImage: item.heroImage || "",
    isActive: item.isActive ?? true,
    faqs: Array.isArray(item.faqs)
      ? item.faqs.map(normalizeFaq).filter(Boolean)
      : [],
    categories: Array.isArray(item.categories)
      ? item.categories.map(normalizeCategory).filter(Boolean)
      : [],
    contactOptions: Array.isArray(item.contactOptions)
      ? item.contactOptions.map(normalizeContactOption).filter(Boolean)
      : [],
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

const _byIdCache = {};

export const fetchHelpCenter = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(BASE);
    const raw =
      res.data?.data?.helpCenter ||
      res.data?.helpCenter ||
      res.data?.data ||
      res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    if (normalized) {
      dispatch(setFaqs(normalized.faqs || []));
      dispatch(setCategories(normalized.categories || []));
      dispatch(setContactOptions(normalized.contactOptions || []));
    }
    return { success: true, data: normalized };
  } catch (err) {
    if (err.response?.status === 404) {
      dispatch(setHelpCenter(null));
      return { success: true, data: null, empty: true };
    }
    dispatch(
      setError(
        err.response?.data?.message || err.message || "Failed to fetch help center"
      )
    );
    return { success: false, message: err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

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
      res.data?.data?.helpCenter ||
      res.data?.helpCenter ||
      res.data?.data ||
      res.data;
    const normalized = normalizeHelpCenter(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

export const clearHelpCenterByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const createHelpCenter = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(BASE, payload);
    const raw =
      res.data?.data?.helpCenter ||
      res.data?.helpCenter ||
      res.data?.data ||
      res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create",
    };
  }
};

export const updateHelpCenter = (id, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/${id}`, payload);
    const raw =
      res.data?.data?.helpCenter ||
      res.data?.helpCenter ||
      res.data?.data ||
      res.data;
    const normalized = normalizeHelpCenter(raw);
    dispatch(setHelpCenter(normalized));
    clearHelpCenterByIdCache(id);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const deleteHelpCenter = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/${id}`);
    dispatch(setHelpCenter(null));
    clearHelpCenterByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};

export const fetchFaqs = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/faqs`);
    const data =
      res.data?.data?.faqs || res.data?.faqs || res.data?.data || [];
    const normalized = Array.isArray(data)
      ? data.map(normalizeFaq).filter(Boolean)
      : [];
    dispatch(setFaqs(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    if (err.response?.status === 404) {
      dispatch(setFaqs([]));
      return { success: true, data: [] };
    }
    return { success: false, message: err.message };
  }
};

export const addFaq = (payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(`${BASE}/faqs`, payload);
    dispatch(fetchHelpCenter());
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message || err.message || "Failed to add FAQ",
    };
  }
};

export const updateFaq = (faqId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`${BASE}/faqs/${faqId}`, payload);
    const raw =
      res.data?.data?.faq || res.data?.faq || res.data?.data || res.data;
    const normalized = normalizeFaq(raw);
    if (normalized) dispatch(updateFaqInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message || err.message || "Failed to update FAQ",
    };
  }
};

export const deleteFaq = (faqId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/faqs/${faqId}`);
    dispatch(removeFaqFromList(faqId));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message || err.message || "Failed to delete FAQ",
    };
  }
};

export const fetchHelpCategories = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/categories`);
    const data =
      res.data?.data?.categories ||
      res.data?.categories ||
      res.data?.data ||
      [];
    const normalized = Array.isArray(data)
      ? data.map(normalizeCategory).filter(Boolean)
      : [];
    dispatch(setCategories(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    if (err.response?.status === 404) {
      dispatch(setCategories([]));
      return { success: true, data: [] };
    }
    return { success: false, message: err.message };
  }
};

export const addHelpCategory = (payload) => async (dispatch) => {
  try {
    await axiosInstance.post(`${BASE}/categories`, payload);
    dispatch(fetchHelpCenter());
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to add category",
    };
  }
};

export const updateHelpCategory = (catId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(
      `${BASE}/categories/${catId}`,
      payload
    );
    const raw =
      res.data?.data?.category ||
      res.data?.category ||
      res.data?.data ||
      res.data;
    const normalized = normalizeCategory(raw);
    if (normalized) dispatch(updateCategoryInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to update category",
    };
  }
};

export const deleteHelpCategory = (catId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/categories/${catId}`);
    dispatch(removeCategoryFromList(catId));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to delete category",
    };
  }
};

export const fetchContactOptions = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`${BASE}/contact-options`);
    const data =
      res.data?.data?.contactOptions ||
      res.data?.contactOptions ||
      res.data?.data ||
      [];
    const normalized = Array.isArray(data)
      ? data.map(normalizeContactOption).filter(Boolean)
      : [];
    dispatch(setContactOptions(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    if (err.response?.status === 404) {
      dispatch(setContactOptions([]));
      return { success: true, data: [] };
    }
    return { success: false, message: err.message };
  }
};

export const addContactOption = (payload) => async (dispatch) => {
  try {
    await axiosInstance.post(`${BASE}/contact-options`, payload);
    dispatch(fetchHelpCenter());
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to add contact option",
    };
  }
};

export const updateContactOption = (contactId, payload) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(
      `${BASE}/contact-options/${contactId}`,
      payload
    );
    const raw =
      res.data?.data?.contact ||
      res.data?.contact ||
      res.data?.data ||
      res.data;
    const normalized = normalizeContactOption(raw);
    if (normalized) dispatch(updateContactOptionInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to update contact option",
    };
  }
};

export const deleteContactOption = (contactId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`${BASE}/contact-options/${contactId}`);
    dispatch(removeContactOptionFromList(contactId));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Failed to delete contact option",
    };
  }
};