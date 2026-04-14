"use client";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState } from "react";

const SIDEBAR_EXPANDED = 272;
const SIDEBAR_COLLAPSED = 72;

export default function DashboardLayout({ children }) {
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const [isLg, setIsLg] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => setIsLg(window.innerWidth >= 1024);
    check();
    setMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const ml = mounted && isLg ? (isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED) : 0;

  return (
    <div className="min-h-screen bg-[#f5f7fb] dark:bg-[#07090f]">
      <Sidebar />
      <MobileSidebar />
      <motion.div
        className="flex flex-col min-h-screen"
        animate={{ marginLeft: ml }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ willChange: "margin-left" }}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
        <Footer />
      </motion.div>
    </div>
  );
}