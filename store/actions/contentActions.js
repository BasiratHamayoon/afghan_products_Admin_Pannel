import {
    setLoading, setBanners, setAnnouncements, setBlogs, setAds,
    addBanner, addAnnouncement, addBlog, addAd,
    updateBanner, updateAnnouncement, updateBlog, updateAd,
    deleteBanner, deleteAnnouncement, deleteBlog, deleteAd,
    setSelectedBanner, setSelectedAnnouncement, setSelectedBlog, setSelectedAd,
    setError,
  } from "@/store/slices/contentSlice";
  import { dummyBanners, dummyAnnouncements, dummyBlogs, dummyAds } from "@/data/dummyContent";
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
  export const fetchBanners = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setBanners(dummyBanners || []));
    } catch { dispatch(setError("Failed to fetch banners")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchAnnouncements = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setAnnouncements(dummyAnnouncements || []));
    } catch { dispatch(setError("Failed to fetch announcements")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchBlogs = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setBlogs(dummyBlogs || []));
    } catch { dispatch(setError("Failed to fetch blogs")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchAds = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setAds(dummyAds || []));
    } catch { dispatch(setError("Failed to fetch ads")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchBannerById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      const found = (dummyBanners || []).find((b) => b.id === id) || null;
      dispatch(setSelectedBanner(found));
    } catch { dispatch(setError("Failed to fetch banner")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchBlogById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      const found = (dummyBlogs || []).find((b) => b.id === id) || null;
      dispatch(setSelectedBlog(found));
    } catch { dispatch(setError("Failed to fetch blog")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchAdById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      const found = (dummyAds || []).find((a) => a.id === id) || null;
      dispatch(setSelectedAd(found));
    } catch { dispatch(setError("Failed to fetch ad")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createBanner = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newItem = { ...data, id: `ban-${Date.now()}`, clicks: 0, impressions: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addBanner(newItem));
      return { success: true, data: newItem };
    } catch { dispatch(setError("Failed to create banner")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createAnnouncement = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newItem = { ...data, id: `ann-${Date.now()}`, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addAnnouncement(newItem));
      return { success: true, data: newItem };
    } catch { dispatch(setError("Failed to create announcement")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createBlog = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newItem = { ...data, id: `blg-${Date.now()}`, views: 0, publishedAt: data.status === "published" ? new Date().toISOString() : null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addBlog(newItem));
      return { success: true, data: newItem };
    } catch { dispatch(setError("Failed to create blog")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createAd = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newItem = { ...data, id: `ad-${Date.now()}`, spent: 0, impressions: 0, clicks: 0, conversions: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addAd(newItem));
      return { success: true, data: newItem };
    } catch { dispatch(setError("Failed to create ad")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editBanner = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateBanner(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update banner")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editAnnouncement = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateAnnouncement(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update announcement")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editBlog = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateBlog(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update blog")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editAd = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateAd(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update ad")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeBanner = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteBanner(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete banner")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeAnnouncement = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteAnnouncement(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete announcement")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeBlog = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteBlog(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete blog")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeAd = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteAd(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete ad")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };