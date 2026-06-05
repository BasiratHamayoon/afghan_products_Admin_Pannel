import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setUsers,
  setStats,
  setPaginationMeta,
  updateUserInList,
  removeUserFromList,
  setSelectedUser,
  setError,
} from "@/store/slices/usersSlice";

const normalizeUser = (item) => {
  if (!item) return null;
  const rawStatus = item.userStatus || item.status || "ACTIVE";
  return {
    ...item,
    id: item._id || item.id,
    name:
      `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
      item.name ||
      "Unknown",
    firstName: item.firstName || "",
    lastName: item.lastName || "",
    email: item.email || "",
    role: (item.role || "BUYER").toUpperCase(),
    status: rawStatus.toUpperCase(),
    businessId:
      item.business?._id ||
      item.business?.id ||
      (typeof item.business === "string" ? item.business : null),
    hasBusiness: !!item.business,
  };
};

let _listFetchInProgress = false;
let _statsFetchInProgress = false;
let _statsFetchDone = false;
const _byIdCache = {};

export const fetchUsers = (params = {}) => async (dispatch) => {
  if (_listFetchInProgress) return;
  _listFetchInProgress = true;
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", role, status, sortBy, sortOrder } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (role && role !== "all") query.set("role", role.toUpperCase());
    if (status && status !== "all") query.set("status", status.toUpperCase());
    if (sortBy) query.set("sortBy", sortBy);
    if (sortOrder) query.set("sortOrder", sortOrder);

    const res = await axiosInstance.get(`/users?${query.toString()}`);
    const data = res.data;
    const raw = data.users || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeUser).filter(Boolean) : [];

    dispatch(setUsers(normalized));
    dispatch(setPaginationMeta({
      page: data.page || data.currentPage || page,
      limit: data.limit || limit,
      total: data.total || data.totalCount || normalized.length,
      totalPages: data.totalPages || 1,
    }));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch users"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
    _listFetchInProgress = false;
  }
};

export const fetchUserStats = () => async (dispatch) => {
  if (_statsFetchInProgress || _statsFetchDone) return;
  _statsFetchInProgress = true;
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/users/stats");
    const data = res.data?.data || res.data?.stats || res.data;
    dispatch(setStats(data));
    _statsFetchDone = true;
    return { success: true, data };
  } catch (err) {
    _statsFetchDone = false;
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setStatsLoading(false));
    _statsFetchInProgress = false;
  }
};

export const fetchUserById = (id) => async (dispatch) => {
  if (!id) return { success: false };

  if (_byIdCache[id] && _byIdCache[id] !== "loading") {
    dispatch(setSelectedUser(_byIdCache[id]));
    return { success: true, data: _byIdCache[id] };
  }

  if (_byIdCache[id] === "loading") {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (_byIdCache[id] && _byIdCache[id] !== "loading") {
          clearInterval(interval);
          dispatch(setSelectedUser(_byIdCache[id]));
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
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(`/users/${id}`);
    const raw = res.data?.data || res.data?.user || res.data;
    const normalized = normalizeUser(raw);
    _byIdCache[id] = normalized;
    dispatch(setSelectedUser(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch user"));
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const clearUserByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const updateUserStatus = (userId, newStatus) => async (dispatch) => {
  try {
    const apiStatus = newStatus === "BLOCKED" ? "BLOCKED" : "ACTIVE";

    await axiosInstance.patch(`/users/${userId}/status`, {
      userStatus: apiStatus,
    });

    dispatch(updateUserInList({ id: userId, status: apiStatus }));

    if (_byIdCache[userId] && _byIdCache[userId] !== "loading") {
      _byIdCache[userId] = { ..._byIdCache[userId], status: apiStatus };
    }

    return { success: true, status: apiStatus };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const deleteUser = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/users/${id}`);
    dispatch(removeUserFromList(id));
    clearUserByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};