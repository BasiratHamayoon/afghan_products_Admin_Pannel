"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRTL } from "@/i18n";

export default function DirectionWrapper({ children }) {
  const { i18n } = useTranslation();
  const dir = isRTL(i18n.language) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("lang", i18n.language || "en");
    document.documentElement.setAttribute("dir", "ltr");
    document.body.setAttribute("dir", "ltr");
  }, [i18n.language]);

  return <div dir={dir} className="min-h-screen">{children}</div>;
}