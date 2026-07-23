"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { isRTL } from "./index";

export default function I18nProvider({ children }) {
  useEffect(() => {
    const applyDir = (lang) => {
      const dir = isRTL(lang) ? "rtl" : "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.style.direction = dir;
    };

    const stored = localStorage.getItem("i18n_lang");
    const lang = stored || i18n.language || "en";
    applyDir(lang);

    i18n.on("languageChanged", applyDir);
    return () => {
      i18n.off("languageChanged", applyDir);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}