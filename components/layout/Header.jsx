"use client";

import { useSelector, useDispatch } from "react-redux";
import { Bell, Search, Menu, X, PanelLeftOpen, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { setMobileSidebarOpen, toggleSidebar } from "@/store/slices/sidebarSlice";
import { logout } from "@/store/slices/authSlice";
import { getInitials } from "@/lib/formatters";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useRouter } from "next/navigation";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isCollapsed } = useSelector((state) => state.sidebar);
  const { unreadCount } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New seller registered", time: "2 min ago", read: false },
    { id: 2, title: "Product awaiting approval", time: "15 min ago", read: false },
    { id: 3, title: "Dispute #1234 escalated", time: "1 hour ago", read: false },
    { id: 4, title: "Withdrawal request pending", time: "2 hours ago", read: true },
    { id: 5, title: "System update completed", time: "5 hours ago", read: true },
  ]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => {
      setShowNotifications(false);
      setShowProfile(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutDialog(false);
    router.push("/login");
  };

  const handleDismissNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

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

          <div className="hidden md:flex relative items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
            <input
              placeholder="Search anything..."
              className="w-64 lg:w-72 pl-10 pr-4 py-2 rounded-xl text-sm font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/40 cursor-text text-foreground dark:text-foreground"
              style={{
                background: "rgba(15,105,176,0.04)",
                border: "1px solid rgba(15,105,176,0.08)",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid rgba(15,105,176,0.3)";
                e.target.style.boxShadow = "0 0 0 3px rgba(15,105,176,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(15,105,176,0.08)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden h-9 w-9 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <X className="h-4.5 w-4.5 text-muted-foreground" />
            ) : (
              <Search className="h-4.5 w-4.5 text-muted-foreground" />
            )}
          </motion.button>
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
              style={{
                border: "1px solid rgba(15,105,176,0.08)",
                background: "rgba(15,105,176,0.04)",
              }}
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black px-1"
                  style={{ border: "2px solid white" }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[72px] sm:top-12 w-auto sm:w-80 rounded-2xl overflow-hidden z-50 bg-white dark:bg-[#0f1420]"
                  style={{
                    border: "1px solid rgba(15,105,176,0.1)",
                    boxShadow: "0 20px 60px rgba(15,105,176,0.12), 0 4px 16px rgba(0,0,0,0.08)",
                  }}
                >
                  <div
                    className="px-4 py-3.5 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}
                  >
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{notifications.filter(n => !n.read).length} unread</p>
                    </div>
                    <button
                      className="text-[11px] font-bold cursor-pointer text-[#0F69B0] hover:underline"
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs font-semibold text-muted-foreground">No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50/40 dark:hover:bg-white/[0.03] group/notif"
                          style={{
                            borderBottom: "1px solid rgba(15,105,176,0.04)",
                            background: !notif.read ? "rgba(15,105,176,0.02)" : "transparent",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                              style={{ background: notif.read ? "rgba(148,163,184,0.4)" : "#0F69B0" }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-xs font-semibold", notif.read ? "text-muted-foreground" : "text-foreground")}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{notif.time}</p>
                            </div>
                            <button
                              onClick={(e) => handleDismissNotification(e, notif.id)}
                              className="h-5 w-5 rounded-md flex items-center justify-center opacity-0 group-hover/notif:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-white/[0.08] shrink-0"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-px h-5 mx-0.5" style={{ background: "rgba(15,105,176,0.1)" }} />

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
              style={{
                border: "1px solid rgba(15,105,176,0.08)",
                background: "rgba(15,105,176,0.03)",
              }}
            >
              <div
                className="relative h-7 w-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                  boxShadow: "0 2px 8px rgba(15,105,176,0.3)",
                }}
              >
                <span className="text-white text-[11px] font-black">
                  {getInitials(user?.name || "Admin User")}
                </span>
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
                  <div className="p-4" style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                      >
                        <span className="text-white text-xs font-black">
                          {getInitials(user?.name || "Admin User")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{user?.name || "Admin User"}</p>
                        <p className="text-[10px] text-muted-foreground">{user?.email || "admin@afghanproducts.com"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1.5">
                    {[
                      { label: "My Profile", desc: "View & edit profile" },
                      { label: "Settings", desc: "Preferences & security" },
                      { label: "Help Center", desc: "Get support" },
                    ].map((item) => (
                      <motion.button
                        key={item.label}
                        whileHover={{ x: 3 }}
                        className="w-full text-left px-4 py-2.5 transition-colors cursor-pointer hover:bg-blue-50/50 dark:hover:bg-white/[0.03]"
                      >
                        <p className="text-xs font-semibold text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                      </motion.button>
                    ))}
                  </div>
                  <div className="py-1.5" style={{ borderTop: "1px solid rgba(15,105,176,0.07)" }}>
                    <motion.button
                      whileHover={{ x: 3 }}
                      onClick={() => {
                        setShowProfile(false);
                        setLogoutDialog(true);
                      }}
                      className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-red-500 cursor-pointer hover:bg-red-50/60 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5 shrink-0" />
                      Sign Out
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-16 p-4 bg-white/95 dark:bg-[#0a0d18]/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] md:hidden z-20"
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <input
                  autoFocus
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none cursor-text text-foreground"
                  style={{
                    background: "rgba(15,105,176,0.04)",
                    border: "1px solid rgba(15,105,176,0.15)",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ConfirmDialog
        open={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log in again to access the admin portal."
        confirmLabel="Sign Out"
        cancelLabel="Stay Logged In"
        variant="danger"
      />
    </>
  );
}