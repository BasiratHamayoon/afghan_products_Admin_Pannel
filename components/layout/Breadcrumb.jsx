"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { sidebarMenuItems } from "@/config/sidebarConfig";

const EXTRA_LABEL_KEYS = {
  add: "breadcrumb.add",
  edit: "breadcrumb.edit",
  details: "breadcrumb.details",
  view: "breadcrumb.view",
  "unlock-requests": "sidebar.unlockRequests",
};

const flattenMenuItems = (items, parentTrail = []) => {
  let result = [];

  for (const item of items) {
    const current = {
      id: item.id,
      href: item.href,
      labelKey: item.labelKey,
      trail: [...parentTrail, { href: item.href, labelKey: item.labelKey, id: item.id }],
    };

    result.push(current);

    if (Array.isArray(item.submenu) && item.submenu.length > 0) {
      result = result.concat(flattenMenuItems(item.submenu, current.trail.slice(0, -1)));
    }
  }

  return result;
};

const flatMenu = flattenMenuItems(sidebarMenuItems);

const normalizePath = (path) => {
  if (!path) return "/";
  return path.replace(/\/+$/, "") || "/";
};

const isMongoId = (value) => /^[a-f\d]{24}$/i.test(value);
const isNumeric = (value) => /^\d+$/.test(value);

export default function Breadcrumb() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();

  const normalizedPath = normalizePath(pathname);

  const matchedItem =
    flatMenu
      .filter((item) => {
        const itemPath = normalizePath(item.href);
        return (
          normalizedPath === itemPath ||
          normalizedPath.startsWith(`${itemPath}/`)
        );
      })
      .sort((a, b) => normalizePath(b.href).length - normalizePath(a.href).length)[0] || null;

  let breadcrumbItems = matchedItem ? [...matchedItem.trail] : [];

  const segments = normalizedPath.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  const knownHrefs = new Set(breadcrumbItems.map((item) => normalizePath(item.href)));

  if (normalizedPath !== "/" && !knownHrefs.has(normalizedPath)) {
    let lastLabel = "";

    if (lastSegment === "add") {
      const mode = searchParams.get("mode");
      if (mode === "edit") lastLabel = t("breadcrumb.edit");
      else if (mode === "products") lastLabel = t("sections.manageProducts");
      else lastLabel = t("breadcrumb.add");
    } else if (EXTRA_LABEL_KEYS[lastSegment]) {
      lastLabel = t(EXTRA_LABEL_KEYS[lastSegment]);
    } else if (isMongoId(lastSegment) || isNumeric(lastSegment)) {
      lastLabel = t("breadcrumb.details");
    } else {
      lastLabel = lastSegment.replace(/-/g, " ");
    }

    breadcrumbItems.push({
      href: normalizedPath,
      label: lastLabel,
      isCustom: true,
    });
  }

  const getLabel = (item) => {
    if (item.label) return item.label;
    if (item.labelKey) return t(item.labelKey);
    return "";
  };

  return (
    <motion.nav
      key={i18n.language}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-1.5 text-sm mb-6 flex-wrap"
    >
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-[#0F69B0] transition-colors"
        aria-label={t("breadcrumb.home")}
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const label = getLabel(item);

        return (
          <div key={`${item.href}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 breadcrumb-rtl-chevron" />
            {isLast ? (
              <span className="font-medium text-foreground capitalize">
                {label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-[#0F69B0] capitalize transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
}