import axiosInstance from "@/lib/axiosInstance";
import {
  setStatsLoading, setStats, setStatsError,
  setRevenueLoading, setRevenueData, setCategories, setRevenueError,
  setUserYearLoading, setUserYearData, setPendingItems, setUserYearError,
} from "@/store/slices/dashboardSlice";

export const fetchDashboardStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/dashboard/stats");
    const data = res.data?.dashboard || res.data?.stats || res.data;
    dispatch(setStats(data));
    return { success: true, data };
  } catch (err) {
    dispatch(setStatsError(err.response?.data?.message || err.message || "Failed to fetch stats"));
    return { success: false };
  } finally {
    dispatch(setStatsLoading(false));
  }
};

export const fetchRevenueByYear = (year) => async (dispatch) => {
  dispatch(setRevenueLoading(true));
  try {
    const query = year ? `?year=${year}` : "";
    const res = await axiosInstance.get(`/dashboard/revenue-year${query}`);
    const data = res.data;
    dispatch(setRevenueData(data.revenueByMonth || []));
    dispatch(setCategories(data.categories || []));
    return { success: true };
  } catch (err) {
    dispatch(setRevenueError(err.response?.data?.message || err.message || "Failed to fetch revenue"));
    return { success: false };
  } finally {
    dispatch(setRevenueLoading(false));
  }
};

export const fetchUserYearData = (year) => async (dispatch) => {
  dispatch(setUserYearLoading(true));
  try {
    const query = year ? `?year=${year}` : "";
    const res = await axiosInstance.get(`/dashboard/user-year${query}`);
    const data = res.data;
    dispatch(setUserYearData(data.monthlyUserCounts || []));
    dispatch(setPendingItems(data.pendingItems || []));
    return { success: true };
  } catch (err) {
    dispatch(setUserYearError(err.response?.data?.message || err.message || "Failed to fetch user data"));
    return { success: false };
  } finally {
    dispatch(setUserYearLoading(false));
  }
};