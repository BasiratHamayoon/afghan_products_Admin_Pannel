import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import usersSlice from "./slices/usersSlice";
import sellersSlice from "./slices/sellersSlice";
import verificationsSlice from "./slices/verificationsSlice";
import productsSlice from "./slices/productsSlice";
import categoriesSlice from "./slices/categoriesSlice";
import tradeLeadsSlice from "./slices/tradeLeadsSlice";
import paymentsSlice from "./slices/paymentsSlice";
import walletsSlice from "./slices/walletsSlice";
import investmentsSlice from "./slices/investmentsSlice";
import consultingSlice from "./slices/consultingSlice";
import contentSlice from "./slices/contentSlice";
import adsSlice from "./slices/adsSlice";
import disputesSlice from "./slices/disputesSlice";
import settingsSlice from "./slices/settingsSlice";
import notificationsSlice from "./slices/notificationsSlice";
import sidebarSlice from "./slices/sidebarSlice";
import uiSlice from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    sellers: sellersSlice,
    verifications: verificationsSlice,
    products: productsSlice,
    categories: categoriesSlice,
    tradeLeads: tradeLeadsSlice,
    payments: paymentsSlice,
    wallets: walletsSlice,
    investments: investmentsSlice,
    consulting: consultingSlice,
    content: contentSlice,
    ads: adsSlice,
    disputes: disputesSlice,
    settings: settingsSlice,
    notifications: notificationsSlice,
    sidebar: sidebarSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;