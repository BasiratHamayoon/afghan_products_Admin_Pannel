"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/sidebarConfig";
import { setMobileSidebarOpen, toggleSubmenu } from "@/store/slices/sidebarSlice";
import { ChevronDown, X, LogOut } from "lucide-react";

export default function MobileSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isMobileOpen, openSubmenus } = useSelector((state) => state.sidebar);

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden cursor-pointer"
          />

          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 z-50 h-screen w-[272px] flex flex-col lg:hidden overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
              borderRight: "1px solid rgba(15,105,176,0.08)",
              boxShadow: "4px 0 30px rgba(0,0,0,0.12)",
            }}
          >
            <div className="hidden dark:block absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(180deg, #0a0d18 0%, #080b14 100%)" }}
            />

            <div
              className="relative z-10 flex h-16 items-center justify-between px-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(15,105,176,0.07)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center"
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
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full"
                    style={{ border: "2px solid white" }}
                  />
                </div>
                <div>
                  <h1
                    className="text-sm font-black"
                    style={{
                      background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Afghan Products
                  </h1>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                    Admin Portal
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setMobileSidebarOpen(false))}
                className="h-8 w-8 rounded-xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto py-3 scrollbar-thin">
              <p className="px-4 mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground/40">
                Navigation
              </p>
              <nav className="px-2 space-y-0.5">
                {sidebarMenuItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const isSubmenuOpen = openSubmenus.includes(item.id);
                  const Icon = item.icon;

                  return (
                    <div key={item.id}>
                      {item.submenu ? (
                        <button
                          onClick={() => dispatch(toggleSubmenu(item.id))}
                          className={cn(
                            "flex items-center justify-between w-full h-10 px-3 rounded-xl transition-all duration-200 text-[13px] cursor-pointer",
                            isActive
                              ? "text-[#0F69B0] font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          style={isActive ? { background: "rgba(15,105,176,0.08)" } : {}}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background: isActive ? "rgba(15,105,176,0.12)" : "rgba(0,0,0,0.04)" }}
                            >
                              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#0F69B0]" : "text-muted-foreground")} />
                            </div>
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                          >
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                          </motion.div>
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => dispatch(setMobileSidebarOpen(false))}
                          className={cn(
                            "flex items-center gap-2.5 h-10 px-3 rounded-xl transition-all duration-200 text-[13px] cursor-pointer",
                            isActive ? "text-white font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
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
                          <div
                            className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", isActive ? "bg-white/20" : "")}
                            style={!isActive ? { background: "rgba(0,0,0,0.04)" } : {}}
                          >
                            <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-muted-foreground")} />
                          </div>
                          <span>{item.label}</span>
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
                                    onClick={() => dispatch(setMobileSidebarOpen(false))}
                                    className={cn(
                                      "flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer",
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
                                    <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", isSubActive ? "bg-white" : "bg-muted-foreground/30")} />
                                    {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </div>

            <div
              className="relative z-10 p-2.5 shrink-0"
              style={{ borderTop: "1px solid rgba(15,105,176,0.07)" }}
            >
              <button className="flex items-center gap-3 h-10 w-full px-3 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-[13px] font-semibold cursor-pointer">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <LogOut className="h-3.5 w-3.5" />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}