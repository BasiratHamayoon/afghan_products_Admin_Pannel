import {
    setLoading, setProducts, addProduct, updateProduct,
    deleteProduct, setSelectedProduct, setError,
  } from "@/store/slices/productsSlice";
  import { dummyProducts } from "@/data/dummyProducts";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchProducts = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setProducts(dummyProducts || []));
    } catch { dispatch(setError("Failed to fetch products")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchProductById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedProduct(null)); return; }
      const found = (dummyProducts || []).find((p) => p && p.id === id) || null;
      dispatch(setSelectedProduct(found));
    } catch { dispatch(setError("Failed to fetch product")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createProduct = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newProduct = {
        ...data,
        id: `prod-${Date.now()}`,
        rating: 0,
        reviewsCount: 0,
        soldCount: 0,
        views: 0,
        reportCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addProduct(newProduct));
      return { success: true, data: newProduct };
    } catch { dispatch(setError("Failed to create product")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editProduct = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid data");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateProduct(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update product")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeProduct = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID");
      dispatch(deleteProduct(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete product")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const approveProduct = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const product = getState().products.products.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");
      const updated = { ...product, status: "approved", approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(updateProduct(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to approve product")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const rejectProduct = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const product = getState().products.products.find((p) => p.id === id);
      if (!product) throw new Error("Product not found");
      const updated = { ...product, status: "rejected", updatedAt: new Date().toISOString() };
      dispatch(updateProduct(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to reject product")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };