import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setReviews,
  setPaginationMeta,
  updateReviewInList,
  toggleReviewVisibility,
  removeReview,
  setError,
} from "@/store/slices/reviewsSlice";

const normalizeReview = (item) => {
  if (!item) return null;

  const userId = item.userId;
  const firstName = userId?.firstName || "";
  const lastName = userId?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const productId = item.productId;
  const businessId = item.businessId;

  return {
    ...item,
    id: item._id || item.id,
    userId: userId?._id || userId?.id || userId,
    userName: fullName || userId?.name || item.userName || "Unknown User",
    userEmail: userId?.email || item.userEmail || "",
    productId: productId?._id || productId?.id || productId || null,
    productName: productId?.name || item.productName || null,
    businessId: businessId?._id || businessId?.id || businessId || null,
    businessName: businessId?.name || item.businessName || null,
    rating: item.stars ?? item.rating ?? 0,
    comment: item.message || item.comment || item.text || item.content || "",
    type: item.type || null,
    isVisible: item.isVisible ?? true,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

export const fetchReviews = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isVisible, productId, businessId } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isVisible !== undefined) query.set("isVisible", String(isVisible));
    if (productId) query.set("productId", productId);
    if (businessId) query.set("businessId", businessId);

    const res = await axiosInstance.get(`/reviews?${query.toString()}`);
    const data = res.data;
    const raw = data.reviews || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeReview).filter(Boolean) : [];

    dispatch(setReviews(normalized));
    dispatch(
      setPaginationMeta({
        page: data.page || data.currentPage || page,
        limit: data.limit || limit,
        total: data.total || data.totalCount || normalized.length,
        totalPages: data.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(setError(err.message || "Failed to fetch reviews"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const toggleReviewVisibilityAction = (id) => async (dispatch) => {
  try {
    dispatch(toggleReviewVisibility(id));
    await axiosInstance.patch(`/reviews/${id}/toggle_visibility`);
    return { success: true };
  } catch (err) {
    dispatch(toggleReviewVisibility(id));
    return { success: false, message: err.message };
  }
};

export const deleteReviewAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/reviews/${id}`);
    dispatch(removeReview(id));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateReviewAction = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/reviews/${id}`, data);
    const raw = res.data?.data || res.data?.review || res.data;
    const normalized = normalizeReview(raw);
    if (normalized) dispatch(updateReviewInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.message };
  }
};