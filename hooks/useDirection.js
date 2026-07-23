"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { isRTL } from "@/i18n";

export function useDirection() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [rtl, setRtl] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRtl(isRTL(i18n.language));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setRtl(isRTL(i18n.language));
  }, [i18n.language, mounted]);

  return { rtl, dir: rtl ? "rtl" : "ltr", mounted };
}