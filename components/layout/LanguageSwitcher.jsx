"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸" },
  { code: "ps", label: "Pashto", nativeLabel: "پښتو", flag: "🇦🇫" },
  { code: "fa", label: "Farsi", nativeLabel: "فارسی", flag: "🇦🇫" },
];

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer relative overflow-hidden group"
        style={{
          border: "1px solid rgba(15,105,176,0.1)",
          background: "rgba(15,105,176,0.04)",
        }}
      >
        <span
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
          style={{ background: "rgba(15,105,176,0.1)" }}
        />
        <Languages className="h-4 w-4 text-[#0F69B0] relative z-10" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute end-0 top-12 w-52 rounded-2xl overflow-hidden z-50 bg-white dark:bg-[#0f1420]"
            style={{
              border: "1px solid rgba(15,105,176,0.1)",
              boxShadow: "0 20px 60px rgba(15,105,176,0.12), 0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}
            >
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                {t("common.language")}
              </p>
            </div>

            <div className="py-1.5">
              {LANGUAGES.map((lang) => {
                const isActive = currentLang.code === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    whileHover={{ x: 3 }}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer hover:bg-blue-50/50 dark:hover:bg-white/[0.03]"
                    style={isActive ? { background: "rgba(15,105,176,0.06)" } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="text-start">
                        <p
                          className={`text-xs font-semibold ${
                            isActive ? "text-[#0F69B0]" : "text-foreground"
                          }`}
                        >
                          {lang.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {lang.nativeLabel}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div
                          className="h-5 w-5 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(15,105,176,0.12)" }}
                        >
                          <Check className="h-3 w-3 text-[#0F69B0]" />
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}