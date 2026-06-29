import {
  LayoutDashboard, Users, ShieldCheck, Package,
  FolderTree, TrendingUp, Settings, FolderOpen,
  Layers, Tag, LayoutGrid, Star, Unlock, List,
  ShoppingCart, MessageCircle, Info, CalendarDays,
  HelpCircle, Image, Award, Briefcase, Handshake,
  GraduationCap, Headphones,
} from "lucide-react";

export const sidebarMenuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "users-sellers", label: "Users & Sellers", icon: Users, href: "/users-sellers" },
  { id: "verifications", label: "Verifications", icon: ShieldCheck, href: "/verifications" },
  { id: "products", label: "Products", icon: Package, href: "/products" },
  {
    id: "categories", label: "Categories", icon: FolderTree, href: "/categories",
    submenu: [
      { id: "categories-all", label: "All Categories", icon: FolderOpen, href: "/categories" },
      { id: "categories-sub", label: "Sub Categories", icon: Layers, href: "/categories/sub-categories" },
      { id: "categories-product-types", label: "Product Types", icon: Tag, href: "/categories/product-types" },
    ],
  },
  { id: "sections", label: "Section Management", icon: LayoutGrid, href: "/sections" },
  { id: "banners", label: "Banners", icon: Image, href: "/banners" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/reviews" },
  {
    id: "trade-leads", label: "Trade Leads", icon: TrendingUp, href: "/trade-leads",
    submenu: [
      { id: "trade-leads-all", label: "All Trade Leads", icon: List, href: "/trade-leads" },
      { id: "trade-leads-unlock", label: "Unlock Requests", icon: Unlock, href: "/trade-leads/unlock-requests" },
    ],
  },
  { id: "trade-shows", label: "Trade Shows", icon: CalendarDays, href: "/trade-shows" },
  { id: "investments", label: "Investments", icon: Briefcase, href: "/investments" },
  { id: "partners", label: "Partners", icon: Handshake, href: "/partners" },
  { id: "consultancy", label: "Consultancy", icon: GraduationCap, href: "/consultancy" },
  { id: "support-chat", label: "Support Chat", icon: Headphones, href: "/support-chat" },
  { id: "success-stories", label: "Success Stories", icon: Award, href: "/success-stories" },
  { id: "orders", label: "Orders", icon: ShoppingCart, href: "/orders" },
  { id: "contact-us", label: "Contact Messages", icon: MessageCircle, href: "/contact-us" },
  { id: "help-center", label: "Help Center", icon: HelpCircle, href: "/help-center" },
  { id: "about", label: "About Management", icon: Info, href: "/about" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];