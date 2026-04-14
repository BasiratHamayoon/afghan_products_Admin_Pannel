"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/store/slices/authSlice";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    setTimeout(() => {
      if (email === "admin@afghanproducts.com" && password === "admin123") {
        dispatch(
          loginSuccess({
            user: {
              id: 1,
              name: "Admin User",
              email: "admin@afghanproducts.com",
              role: "super_admin",
              avatar: null,
            },
            token: "dummy-token-12345",
          })
        );
        toast.success("Welcome back, Admin!");
        router.push("/dashboard");
      } else {
        dispatch(loginFailure("Invalid email or password"));
        toast.error("Invalid credentials!");
      }
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_80px_rgba(15,105,176,0.18)] dark:shadow-[0_20px_80px_rgba(15,105,176,0.1)]">
        <div className="absolute inset-0 bg-white/70 dark:bg-[#0a0f1e]/80 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F69B0]/8 via-transparent to-violet-500/8" />
        <div className="absolute inset-[1px] rounded-[2rem] border border-white/70 dark:border-white/8" />

        <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#0F69B0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-violet-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative px-8 pt-9 pb-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5"
          >
            <Image
              src="/images/logo.png"
              alt="Afghan Products"
              width={130}
              height={46}
              className="object-contain"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="text-center mb-2"
          >
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0F69B0]/12 to-violet-500/12 border border-[#0F69B0]/25 rounded-full px-3.5 py-1.5 mb-3">
              <ShoppingBag className="h-3 w-3 text-[#0F69B0]" />
              <span className="text-[10px] font-extrabold text-[#0F69B0] tracking-[0.15em] uppercase">
                Store Admin
              </span>
            </div>
            <h1 className="text-[1.6rem] font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/60 bg-clip-text text-transparent leading-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Sign in to manage your store
            </p>
          </motion.div>
        </div>

        <div className="relative px-8 pb-9 space-y-3.5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.28 }}
            >
              <div
                className={`relative flex items-center rounded-xl border-2 transition-all duration-300 ${
                  focusedField === "email"
                    ? "border-[#0F69B0]/70 bg-[#0F69B0]/5 shadow-[0_0_0_4px_rgba(15,105,176,0.1)]"
                    : "border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#0F69B0]/35 hover:bg-white/80 dark:hover:bg-white/8"
                }`}
              >
                <div
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "email" ? "text-[#0F69B0]" : "text-gray-400 dark:text-white/30"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Email address"
                  className="w-full bg-transparent pl-11 pr-10 py-3.5 text-sm outline-none placeholder:text-gray-400/60 dark:placeholder:text-white/25 text-foreground cursor-text font-medium"
                  required
                />
                <AnimatePresence>
                  {email && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-4 w-2 h-2 rounded-full bg-[#0F69B0]"
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div
                className={`relative flex items-center rounded-xl border-2 transition-all duration-300 ${
                  focusedField === "password"
                    ? "border-[#0F69B0]/70 bg-[#0F69B0]/5 shadow-[0_0_0_4px_rgba(15,105,176,0.1)]"
                    : "border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#0F69B0]/35 hover:bg-white/80 dark:hover:bg-white/8"
                }`}
              >
                <div
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "password"
                      ? "text-[#0F69B0]"
                      : "text-gray-400 dark:text-white/30"
                  }`}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Password"
                  className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm outline-none placeholder:text-gray-400/60 dark:placeholder:text-white/25 text-foreground cursor-text font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 dark:text-white/30 hover:text-[#0F69B0] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between px-0.5 pt-0.5"
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-[#0F69B0] cursor-pointer"
                />
                <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-[#0F69B0] hover:text-[#0A4F85] transition-colors cursor-pointer hover:underline underline-offset-4"
              >
                Forgot password?
              </Link>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-3.5 py-2.5">
                    <p className="text-[11px] text-red-500 text-center font-semibold">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="pt-1"
            >
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group rounded-xl py-3.5 font-bold text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0F69B0]/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F69B0] via-[#1a82d4] to-[#0A4F85]" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ["-130%", "130%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 2.5 }}
                />
                <div className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>

          {/* Demo credentials - commented out
          <div className="bg-[#0F69B0]/5 border border-[#0F69B0]/15 rounded-2xl p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-xs font-mono font-semibold">admin@afghanproducts.com</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password</span>
              <span className="text-xs font-mono font-semibold">admin123</span>
            </div>
          </div>
          */}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-[10px] text-muted-foreground/70 mt-5 font-medium"
      >
        © 2024 Afghan Products. All rights reserved.
      </motion.p>
    </motion.div>
  );
}