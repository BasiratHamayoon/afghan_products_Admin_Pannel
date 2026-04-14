"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
      toast.success("Reset link sent to your email!");
    }, 2000);
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

        <div className="relative px-8 pt-9 pb-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.55 }}
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

          <AnimatePresence mode="wait">
            {isSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="flex flex-col items-center text-center space-y-2 mb-2"
              >
                <div className="relative mb-1">
                  <motion.div
                    className="h-14 w-14 rounded-2xl bg-green-500/10 border-2 border-green-500/25 flex items-center justify-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  </motion.div>
                </div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/60 bg-clip-text text-transparent">
                  Email Sent!
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Check your inbox for the reset link
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center mb-2"
              >
                <div className="relative mb-3">
                  <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-[#0F69B0] to-[#0A4F85] flex items-center justify-center shadow-lg shadow-[#0F69B0]/30 p-3">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-1.5 rounded-2xl border-2 border-[#0F69B0]/20"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/60 bg-clip-text text-transparent">
                  Forgot Password?
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Enter your email to receive a reset link
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative px-8 pb-9">
          <AnimatePresence mode="wait">
            {isSent ? (
              <motion.div
                key="sent-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-xl p-3.5 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1">Reset link sent to</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-400 font-mono">{email}</p>
                </div>
                <p className="text-[11px] text-center text-muted-foreground">
                  Didn&apos;t receive it?{" "}
                  <button
                    onClick={() => setIsSent(false)}
                    className="text-[#0F69B0] font-bold hover:underline cursor-pointer underline-offset-4"
                  >
                    Try again
                  </button>
                </p>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-gray-200/80 dark:border-white/10 hover:border-[#0F69B0]/35 bg-white/60 dark:bg-white/5 text-sm font-bold transition-all hover:bg-[#0F69B0]/5 cursor-pointer text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3"
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
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm outline-none placeholder:text-gray-400/60 dark:placeholder:text-white/25 text-foreground cursor-text font-medium"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden rounded-xl py-3.5 font-bold text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0F69B0]/30"
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
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </motion.button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer pt-0.5 font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}