import {
    setLoading, setUsers, addUser, updateUser,
    deleteUser, setSelectedUser, setError,
  } from "@/store/slices/usersSlice";
  import { dummyUsers } from "@/data/dummyUsers";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchUsers = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setUsers(dummyUsers || []));
    } catch { dispatch(setError("Failed to fetch users")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchUserById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedUser(null)); return; }
      const found = (dummyUsers || []).find((u) => u && u.id === id) || null;
      dispatch(setSelectedUser(found));
    } catch { dispatch(setError("Failed to fetch user")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createUser = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newUser = {
        ...data,
        id: `user-${Date.now()}`,
        stats: { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalReviews: 0, rating: 0, completionRate: 0 },
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        banned: false,
        reportCount: 0,
        walletBalance: 0,
        level: "bronze",
      };
      dispatch(addUser(newUser));
      return { success: true, data: newUser };
    } catch { dispatch(setError("Failed to create user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editUser = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateUser(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeUser = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID");
      dispatch(deleteUser(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const suspendUser = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const user = getState().users.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      const updated = { ...user, status: user.status === "suspended" ? "active" : "suspended", updatedAt: new Date().toISOString() };
      dispatch(updateUser(updated));
      return { success: true, status: updated.status };
    } catch { dispatch(setError("Failed to update user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const verifyUser = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const user = getState().users.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      const updated = { ...user, verified: true, status: "active", updatedAt: new Date().toISOString() };
      dispatch(updateUser(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to verify user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const banUser = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const user = getState().users.users.find((u) => u.id === id);
      if (!user) throw new Error("User not found");
      const updated = { ...user, banned: !user.banned, status: !user.banned ? "banned" : "active", updatedAt: new Date().toISOString() };
      dispatch(updateUser(updated));
      return { success: true, banned: updated.banned };
    } catch { dispatch(setError("Failed to ban user")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };