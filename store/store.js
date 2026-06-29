import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import usersSlice from "./slices/usersSlice";
import verificationsSlice from "./slices/verificationsSlice";
import productsSlice from "./slices/productsSlice";
import categoriesSlice from "./slices/categoriesSlice";
import subCategoriesSlice from "./slices/subCategoriesSlice";
import productTypesSlice from "./slices/productTypesSlice";
import sectionsSlice from "./slices/sectionsSlice";
import reviewsSlice from "./slices/reviewsSlice";
import businessesSlice from "./slices/businessesSlice";
import contactUsReducer from "@/store/slices/contactUsSlice";
import tradeLeadsSlice from "./slices/tradeLeadsSlice";
import settingsSlice from "./slices/settingsSlice";
import sidebarSlice from "./slices/sidebarSlice";
import uiSlice from "./slices/uiSlice";
import dashboardReducer from "@/store/slices/dashboardSlice";
import selectReducer from "@/store/slices/selectSlice";
import ordersReducer from "@/store/slices/ordersSlice";
import aboutReducer from "@/store/slices/aboutSlice";
import tradeShowsReducer from "@/store/slices/tradeShowsSlice";
import helpCenterReducer from "@/store/slices/helpCenterSlice";
import bannersReducer from "@/store/slices/bannersSlice";
import successStoriesReducer from "@/store/slices/successStoriesSlice";
import investmentsReducer from "@/store/slices/investmentsSlice";
import partnersReducer from "@/store/slices/partnersSlice";
import consultancyReducer from "@/store/slices/consultancySlice";
import adminChatReducer from "@/store/slices/adminChatSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    verifications: verificationsSlice,
    products: productsSlice,
    categories: categoriesSlice,
    select: selectReducer,
    subCategories: subCategoriesSlice,
    productTypes: productTypesSlice,
    sections: sectionsSlice,
    contactUs: contactUsReducer,
    dashboard: dashboardReducer,
    reviews: reviewsSlice,
    businesses: businessesSlice,
    tradeLeads: tradeLeadsSlice,
    settings: settingsSlice,
    sidebar: sidebarSlice,
    ui: uiSlice,
    orders: ordersReducer,
    about: aboutReducer,
    tradeShows: tradeShowsReducer,
    helpCenter: helpCenterReducer,
    banners: bannersReducer,
    successStories: successStoriesReducer,
    investments: investmentsReducer,
    partners: partnersReducer,
    consultancy: consultancyReducer,
    adminChat: adminChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;