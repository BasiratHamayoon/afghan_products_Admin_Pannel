"use client";

import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border py-4 px-6" suppressHydrationWarning>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          © {new Date().getFullYear()} {t("footer.copyright")}
        </p>
        <p className="text-xs text-muted-foreground" suppressHydrationWarning>
          {t("footer.version")}
        </p>
      </div>
    </footer>
  );
}