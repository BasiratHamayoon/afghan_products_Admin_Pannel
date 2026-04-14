"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <motion.nav
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-1.5 text-sm mb-6"
    >
      <Link href="/dashboard" className="text-muted-foreground hover:text-[#0F69B0] transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {paths.map((path, index) => (
        <div key={path} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          {index === paths.length - 1 ? (
            <span className="font-medium text-foreground capitalize">
              {path.replace(/-/g, " ")}
            </span>
          ) : (
            <Link
              href={`/${paths.slice(0, index + 1).join("/")}`}
              className="text-muted-foreground hover:text-[#0F69B0] capitalize transition-colors"
            >
              {path.replace(/-/g, " ")}
            </Link>
          )}
        </div>
      ))}
    </motion.nav>
  );
}