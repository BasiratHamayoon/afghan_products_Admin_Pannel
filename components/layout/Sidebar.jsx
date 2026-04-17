// Sidebar.jsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/sidebarConfig";
import { toggleSubmenu } from "@/store/slices/sidebarSlice";
import { logout } from "@/store/slices/authSlice";
import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useRouter } from "next/navigation";

const SIDEBAR_EXPANDED = 272;
const SIDEBAR_COLLAPSED = 72;

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isCollapsed, openSubmenus } = useSelector((state) => state.sidebar);
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setLogoutDialog(false);
    router.push("/login");
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col overflow-hidden will-change-auto"
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
          borderRight: "1px solid rgba(15,105,176,0.08)",
          boxShadow: "2px 0 24px rgba(15,105,176,0.06)",
        }}
      >
        <div className="hidden dark:block absolute inset-0 pointer-events-none z-0"
          style={{ background: "linear-gradient(180deg, #0a0d18 0%, #080b14 100%)" }}
        />

        <div
          className="relative z-10 flex h-16 items-center px-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div
                className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(15,105,176,0.1) 0%, rgba(15,105,176,0.05) 100%)",
                  border: "1px solid rgba(15,105,176,0.12)",
                }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Afghan Products"
                  width={28}
                  height={28}
                  className="object-contain w-7 h-7"
                  priority
                />
              </div>
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full"
                style={{ border: "2px solid white" }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <motion.div
              animate={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto",
                x: isCollapsed ? -8 : 0,
              }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1
                className="text-sm font-black leading-tight"
                style={{
                  background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Afghan Products
              </h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                Admin Portal
              </p>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-3 scrollbar-thin">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1, height: isCollapsed ? 0 : "auto" }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="px-4 mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/40">
              Navigation
            </p>
          </motion.div>

          <nav className="px-2 space-y-0.5">
            {sidebarMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const isSubmenuOpen = openSubmenus.includes(item.id);
              const Icon = item.icon;

              return (
                <div key={item.id}>
                  {isCollapsed ? (
                    <div className="relative group/tip">
                      <Link
                        href={item.submenu ? item.submenu[0].href : item.href}
                        className={cn(
                          "flex items-center justify-center h-10 w-full rounded-xl transition-all duration-200 relative overflow-hidden cursor-pointer",
                          isActive ? "text-white" : "text-muted-foreground hover:text-[#0F69B0]"
                        )}
                        style={
                          isActive
                            ? {
                                background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                                boxShadow: "0 4px 12px rgba(15,105,176,0.3)",
                              }
                            : {}
                        }
                      >
                        {!isActive && (
                          <span
                            className="absolute inset-0 rounded-xl opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200"
                            style={{ background: "rgba(15,105,176,0.08)" }}
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0 relative z-10" />
                      </Link>
                      <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all duration-200 z-[100]">
                        <div
                          className="text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl"
                          style={{ background: "#111827" }}
                        >
                          {item.label}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {item.submenu ? (
                        <button
                          onClick={() => dispatch(toggleSubmenu(item.id))}
                          className={cn(
                            "flex items-center justify-between w-full h-10 px-3 rounded-xl transition-all duration-200 text-[13px] group/item cursor-pointer",
                            isActive
                              ? "text-[#0F69B0] font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          style={isActive ? { background: "rgba(15,105,176,0.08)" } : {}}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                              style={{
                                background: isActive
                                  ? "rgba(15,105,176,0.12)"
                                  : "rgba(0,0,0,0.04)",
                              }}
                            >
                              <Icon
                                className={cn(
                                  "h-3.5 w-3.5 shrink-0 transition-colors",
                                  isActive ? "text-[#0F69B0]" : "text-muted-foreground group-hover/item:text-[#0F69B0]"
                                )}
                              />
                            </div>
                            <span className="truncate font-medium">{item.label}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="shrink-0 ml-1"
                          >
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </motion.div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 h-10 px-3 rounded-xl transition-all duration-200 text-[13px] group/item relative overflow-hidden cursor-pointer",
                            isActive ? "text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                          )}
                          style={
                            isActive
                              ? {
                                  background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                                  boxShadow: "0 4px 14px rgba(15,105,176,0.28)",
                                }
                              : {}
                          }
                        >
                          {!isActive && (
                            <span
                              className="absolute inset-0 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-200"
                              style={{ background: "rgba(15,105,176,0.06)" }}
                            />
                          )}
                          <div
                            className={cn(
                              "relative z-10 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                              isActive ? "bg-white/20" : ""
                            )}
                            style={!isActive ? { background: "rgba(0,0,0,0.04)" } : {}}
                          >
                            <Icon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0 transition-colors",
                                isActive ? "text-white" : "text-muted-foreground group-hover/item:text-[#0F69B0]"
                              )}
                            />
                          </div>
                          <span className="relative z-10 truncate">{item.label}</span>
                          {isActive && (
                            <div className="absolute right-3 z-10 w-1.5 h-1.5 rounded-full bg-white/60" />
                          )}
                        </Link>
                      )}

                      <AnimatePresence initial={false}>
                        {item.submenu && isSubmenuOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div
                              className="ml-5 mt-0.5 mb-1 pl-3 py-0.5 space-y-0.5"
                              style={{ borderLeft: "2px solid rgba(15,105,176,0.1)" }}
                            >
                              {item.submenu.map((sub) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sub.id}
                                    href={sub.href}
                                    className={cn(
                                      "flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[12px] transition-all duration-200 font-medium cursor-pointer",
                                      isSubActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                                    )}
                                    style={
                                      isSubActive
                                        ? {
                                            background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                                            boxShadow: "0 2px 8px rgba(15,105,176,0.22)",
                                          }
                                        : {}
                                    }
                                  >
                                    <div
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                                        isSubActive ? "bg-white" : "bg-muted-foreground/30"
                                      )}
                                    />
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div
          className="relative z-10 p-2.5 shrink-0"
          style={{ borderTop: "1px solid rgba(15,105,176,0.07)" }}
        >
          {isCollapsed ? (
            <div className="relative group/tip">
              <motion.button
                key="logout-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setLogoutDialog(true)}
                className="flex items-center justify-center h-10 w-full rounded-xl transition-all duration-200 cursor-pointer text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-4 w-4" />
              </motion.button>
              <div className="absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all duration-200 z-[100]">
                <div
                  className="text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl"
                  style={{ background: "#111827" }}
                >
                  Sign Out
                </div>
              </div>
            </div>
          ) : (
            <motion.button
              key="logout-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setLogoutDialog(true)}
              className="flex items-center gap-3 h-10 w-full px-3 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-[13px] font-semibold cursor-pointer group/logout"
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.08)" }}
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
              </div>
              <span>Sign Out</span>
            </motion.button>
          )}
        </div>
      </motion.aside>

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