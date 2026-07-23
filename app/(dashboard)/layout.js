"use client";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";
import { useDirection } from "@/hooks/useDirection";

const SIDEBAR_EXPANDED = 272;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout({ children }) {
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const { rtl, mounted } = useDirection();
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarWidth = mounted && isLg
    ? (isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED)
    : 0;

  const marginStyle = mounted && isLg
    ? rtl
      ? { marginRight: sidebarWidth }
      : { marginLeft: sidebarWidth }
    : {};

  return (
    <div
      className="min-h-screen bg-[#f5f7fb] dark:bg-[#07090f]"
      style={mounted ? { direction: rtl ? "rtl" : "ltr" } : {}}
    >
      <Sidebar />
      <MobileSidebar />
      <motion.div
        className="flex flex-col min-h-screen"
        animate={marginStyle}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: "margin-left, margin-right" }}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <Footer />
      </motion.div>
    </div>
  );
}