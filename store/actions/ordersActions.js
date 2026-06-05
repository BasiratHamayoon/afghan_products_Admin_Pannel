import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setDetailLoading,
  setOrders,
  setPaginationMeta,
  setSelectedOrder,
  updateOrderInList,
  removeOrderFromList,
  setError,
} from "@/store/slices/ordersSlice";

const normalizeOrderItem = (item) => {
  if (!item) return null;
  return {
    id: item._id || item.id,
    productId: item.product?._id || item.product?.id || item.product,
    productName: item.product?.name || item.productName || "",
    productImage: item.product?.images?.[0] || item.productImage || null,
    productSlug: item.product?.slug || "",
    sellerId: item.seller?._id || item.seller?.id || item.seller,
    sellerName: item.seller
      ? `${item.seller.firstName || ""} ${item.seller.lastName || ""}`.trim()
      : item.sellerName || "",
    sellerEmail: item.seller?.email || item.sellerEmail || "",
    quantity: item.quantity || 0,
    unitPrice: item.unitPrice || item.price || 0,
    totalPrice:
      item.totalPrice ||
      item.quantity * (item.unitPrice || item.price || 0),
    status: item.status || "PENDING",
    rejectionReason: item.rejectionReason || "",
  };
};

const normalizeShippingAddress = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      const parts = [
        parsed.street,
        parsed.city,
        parsed.state,
        parsed.country,
        parsed.postalCode,
        parsed.zipCode,
        parsed.address,
      ].filter(Boolean);
      return parts.join(", ") || raw;
    } catch {
      return raw;
    }
  }
  if (typeof raw === "object") {
    const parts = [
      raw.street,
      raw.city,
      raw.state,
      raw.country,
      raw.postalCode,
      raw.zipCode,
      raw.address,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return "";
};

const normalizeOrder = (item) => {
  if (!item) return null;

  const rawItems = item.items || item.orderItems || [];
  const normalizedItems = Array.isArray(rawItems)
    ? rawItems.map(normalizeOrderItem).filter(Boolean)
    : [];

  return {
    id: item._id || item.id,
    orderNumber: item.orderNumber || item.orderId || "",
    buyerId: item.buyer?._id || item.buyer?.id || item.buyer,
    buyerName: item.buyer
      ? `${item.buyer.firstName || ""} ${item.buyer.lastName || ""}`.trim()
      : item.buyerName || "",
    buyerEmail: item.buyer?.email || item.buyerEmail || "",
    buyerPhone: item.buyer?.phone || item.buyerPhone || "",
    items: normalizedItems,
    itemCount: normalizedItems.length || item.itemCount || 0,
    totalAmount: item.totalAmount || item.total || item.grandTotal || 0,
    taxPrice: item.taxPrice || 0,
    shippingPrice: item.shippingPrice || 0,
    status: item.status || "PENDING",
    paymentMethod: item.paymentMethod || "",
    paymentStatus: item.paymentStatus || "PENDING",
    deliveryMethod: item.deliveryMethod || "",
    attachment: item.attachment || item.receipt || null,
    shippingAddress: normalizeShippingAddress(item.shippingAddress),
    notes: item.notes || item.note || "",
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

export const fetchOrders = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", status } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (status && status !== "all") query.set("status", status);

    const res = await axiosInstance.get(`/orders/admin/all?${query.toString()}`);
    const data = res.data;
    const raw = data.orders || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeOrder).filter(Boolean)
      : [];

    dispatch(setOrders(normalized));
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
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch orders")
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchOrderById = (id) => async (dispatch, getState) => {
  const existing = getState().orders.orders.find((o) => o.id === id);
  if (existing) {
    dispatch(setSelectedOrder(existing));
    return { success: true, data: existing };
  }
  dispatch(setDetailLoading(true));
  try {
    const res = await axiosInstance.get(`/orders/admin/all?limit=1000`);
    const data = res.data;
    const raw = data.orders || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeOrder).filter(Boolean)
      : [];
    const found = normalized.find((o) => o.id === id);
    if (found) {
      dispatch(setSelectedOrder(found));
      return { success: true, data: found };
    }
    return { success: false, message: "Order not found" };
  } catch (err) {
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch order")
    );
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  } finally {
    dispatch(setDetailLoading(false));
  }
};

export const deleteOrder = (orderId) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/orders/${orderId}`);
    dispatch(removeOrderFromList(orderId));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete order",
    };
  }
};