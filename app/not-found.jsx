"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search } from "lucide-react";

const CIRCLES_CONFIG = [
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
  { size: [100, 400], pos: [20, 90], duration: [15, 30] },
];

export default function NotFound() {
  const router = useRouter();
  const [circles, setCircles] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCircles(
      CIRCLES_CONFIG.map(() => ({
        width: Math.random() * 300 + 100,
        height: Math.random() * 300 + 100,
        left: `${Math.random() * 90 + 5}%`,
        top: `${Math.random() * 90 + 5}%`,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080c18] relative overflow-hidden">
      {mounted && circles.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#0F69B0]/5"
          style={{ width: c.width, height: c.height, left: c.left, top: c.top }}
          animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
          transition={{ duration: c.duration, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 text-center px-6 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="text-[120px] font-black leading-none" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            404
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-black text-foreground mb-2">Page Not Found</h1>
          <p className="text-sm text-muted-foreground font-medium mb-8">
            The page you are looking for does not exist or has been moved.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.back()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
              <ArrowLeft className="h-4 w-4" />Go Back
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/dashboard")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              <Home className="h-4 w-4" />Go to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}