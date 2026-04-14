"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 px-6 max-w-lg"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto h-20 w-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-8"
        >
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </motion.div>

        <h1 className="text-3xl font-bold text-foreground mb-2">Something Went Wrong</h1>
        <p className="text-muted-foreground mb-2">An unexpected error has occurred.</p>
        <p className="text-xs text-red-500/60 mb-8 font-mono bg-red-500/5 rounded-lg p-3 border border-red-500/10">
          {error?.message || "Unknown error"}
        </p>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => reset()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F69B0] text-white hover:bg-[#0A4F85] transition-colors shadow-lg shadow-[#0F69B0]/30"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}