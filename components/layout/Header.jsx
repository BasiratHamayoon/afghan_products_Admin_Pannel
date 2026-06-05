"use client";

import { useSelector, useDispatch } from "react-redux";
import { Menu, PanelLeftOpen, LogOut, Settings, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { setMobileSidebarOpen, toggleSidebar } from "@/store/slices/sidebarSlice";
import { logoutUser } from "@/store/actions/authActions";
import { getInitials } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const { user } = useSelector((state) => state.auth);

  const [showProfile, setShowProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setShowProfile(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const performLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      toast.success("Logged out successfully!");
    } catch {
      toast.success("Logged out successfully!");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setIsLoggingOut(false);
      setLogoutDialog(false);
      router.push("/login");
    }
  }, [dispatch, router, isLoggingOut]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-16 items-center justify-between px-4 lg:px-5 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-[#0a0d18]/95 backdrop-blur-xl shadow-sm"
            : "bg-white/80 dark:bg-[#0a0d18]/80 backdrop-blur-md"
        )}
        style={{
          borderBottom: scrolled
            ? "1px solid rgba(15,105,176,0.1)"
            : "1px solid rgba(15,105,176,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            onClick={() => dispatch(setMobileSidebarOpen(true))}
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex h-9 w-9 rounded-xl items-center justify-center transition-all duration-200 cursor-pointer relative overflow-hidden group"
            style={{
              border: "1px solid rgba(15,105,176,0.1)",
              background: "rgba(15,105,176,0.04)",
            }}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
              style={{ background: "rgba(15,105,176,0.1)" }}
            />
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="relative z-10"
            >
              <PanelLeftOpen className="h-4 w-4 text-[#0F69B0]" />
            </motion.div>
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            >
              <div className="relative">
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                    boxShadow: "0 2px 8px rgba(15,105,176,0.3)",
                  }}
                >
                  <span className="text-white text-[11px] font-black">
                    {getInitials(user?.name || "Admin User")}
                  </span>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full"
                  style={{ border: "1.5px solid white" }}
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[12px] font-bold leading-tight text-foreground">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium capitalize">
                  {user?.role?.replace("_", " ") || "Super Admin"}
                </p>
              </div>
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 top-12 w-56 rounded-2xl overflow-hidden z-50 bg-white dark:bg-[#0f1420]"
                  style={{
                    border: "1px solid rgba(15,105,176,0.1)",
                    boxShadow: "0 20px 60px rgba(15,105,176,0.12), 0 4px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="p-4"
                    style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                        }}
                      >
                        <span className="text-white text-xs font-black">
                          {getInitials(user?.name || "Admin User")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {user?.name || "Admin User"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {user?.email || "admin@afghanproducts.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="py-1.5">
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/settings");
                      }}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors cursor-pointer hover:bg-blue-50/50 dark:hover:bg-white/[0.03]"
                    >
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(15,105,176,0.08)" }}
                      >
                        <Settings className="h-3.5 w-3.5 text-[#0F69B0]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Settings</p>
                        <p className="text-[10px] text-muted-foreground">Preferences & security</p>
                      </div>
                    </motion.button>
                  </div>

                  <div
                    className="py-1.5"
                    style={{ borderTop: "1px solid rgba(15,105,176,0.07)" }}
                  >
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setShowProfile(false);
                        setLogoutDialog(true);
                      }}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-red-500 cursor-pointer hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(239,68,68,0.08)" }}
                      >
                        <LogOut className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-500">Sign Out</p>
                        <p className="text-[10px] text-red-400/70">End your session</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <ConfirmDialog
        open={logoutDialog}
        onClose={() => !isLoggingOut && setLogoutDialog(false)}
        onConfirm={performLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log in again to access the admin portal."
        confirmLabel={isLoggingOut ? "Signing Out..." : "Sign Out"}
        cancelLabel="Stay Logged In"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  );
}