"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const passwordStrength = (pwd) => {
    if (pwd.length === 0) return 0;
    if (pwd.length < 4) return 1;
    if (pwd.length < 7) return 2;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 4;
    return 3;
  };

  const strength = passwordStrength(password);
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthTextColors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-green-500"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsReset(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 2500);
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
            {isReset ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="flex flex-col items-center text-center space-y-2 mb-2"
              >
                <motion.div
                  className="h-14 w-14 rounded-2xl bg-green-500/10 border-2 border-green-500/25 flex items-center justify-center mb-1"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="h-7 w-7 text-green-500" />
                </motion.div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/60 bg-clip-text text-transparent">
                  All Done!
                </h1>
                <p className="text-xs text-muted-foreground font-medium">Redirecting to login...</p>
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
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-1.5 rounded-2xl border-2 border-[#0F69B0]/20"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 dark:from-white dark:via-white/90 dark:to-white/60 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Create a strong new password
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isReset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative px-8 pb-9"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <div
                    className={`relative flex items-center rounded-xl border-2 transition-all duration-300 ${
                      focusedField === "password"
                        ? "border-[#0F69B0]/70 bg-[#0F69B0]/5 shadow-[0_0_0_4px_rgba(15,105,176,0.1)]"
                        : "border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#0F69B0]/35 hover:bg-white/80 dark:hover:bg-white/8"
                    }`}
                  >
                    <div
                      className={`absolute left-4 transition-all duration-300 ${
                        focusedField === "password" ? "text-[#0F69B0]" : "text-gray-400 dark:text-white/30"
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
                      placeholder="New password"
                      className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm outline-none placeholder:text-gray-400/60 dark:placeholder:text-white/25 text-foreground cursor-text font-medium"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-gray-400 dark:text-white/30 hover:text-[#0F69B0] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {password.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2 space-y-1"
                      >
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-400 ${
                                strength >= level ? strengthColors[strength] : "bg-gray-200 dark:bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] font-bold ${strengthTextColors[strength]}`}>
                          {strengthLabels[strength]} password
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <div
                    className={`relative flex items-center rounded-xl border-2 transition-all duration-300 ${
                      focusedField === "confirm"
                        ? "border-[#0F69B0]/70 bg-[#0F69B0]/5 shadow-[0_0_0_4px_rgba(15,105,176,0.1)]"
                        : confirmPassword && confirmPassword !== password
                        ? "border-red-400/60 bg-red-500/3"
                        : confirmPassword && confirmPassword === password
                        ? "border-green-400/60 bg-green-500/3"
                        : "border-gray-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 hover:border-[#0F69B0]/35 hover:bg-white/80 dark:hover:bg-white/8"
                    }`}
                  >
                    <div
                      className={`absolute left-4 transition-all duration-300 ${
                        focusedField === "confirm"
                          ? "text-[#0F69B0]"
                          : confirmPassword && confirmPassword !== password
                          ? "text-red-400"
                          : confirmPassword && confirmPassword === password
                          ? "text-green-400"
                          : "text-gray-400 dark:text-white/30"
                      }`}
                    >
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirm")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Confirm password"
                      className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm outline-none placeholder:text-gray-400/60 dark:placeholder:text-white/25 text-foreground cursor-text font-medium"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 text-gray-400 dark:text-white/30 hover:text-[#0F69B0] transition-colors cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {confirmPassword && confirmPassword !== password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-red-500 font-bold pt-1 pl-1 overflow-hidden"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative overflow-hidden rounded-xl py-3.5 font-bold text-sm text-white disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0F69B0]/30 mt-1"
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
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </div>
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}