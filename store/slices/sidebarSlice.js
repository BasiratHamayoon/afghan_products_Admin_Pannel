import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isCollapsed: false,
  isMobileOpen: false,
  activeMenu: "dashboard",
  openSubmenus: [],
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    setMobileSidebarOpen: (state, action) => {
      state.isMobileOpen = action.payload;
    },
    setActiveMenu: (state, action) => {
      state.activeMenu = action.payload;
    },
    toggleSubmenu: (state, action) => {
      const index = state.openSubmenus.indexOf(action.payload);
      if (index > -1) {
        state.openSubmenus.splice(index, 1);
      } else {
        state.openSubmenus.push(action.payload);
      }
    },
    closeAllSubmenus: (state) => {
      state.openSubmenus = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setActiveMenu,
  toggleSubmenu,
  closeAllSubmenus,
} = sidebarSlice.actions;
export default sidebarSlice.reducer;