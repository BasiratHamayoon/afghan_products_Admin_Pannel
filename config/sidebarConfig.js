import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  FolderTree,
  TrendingUp,
  Wallet,
  PiggyBank,
  MessageSquare,
  Megaphone,
  AlertTriangle,
  Settings,
} from "lucide-react";

export const sidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "users-sellers",
    label: "Users & Sellers",
    icon: Users,
    href: "/users-sellers",
  },
  {
    id: "verifications",
    label: "Verifications",
    icon: ShieldCheck,
    href: "/verifications",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    href: "/products",
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderTree,
    href: "/categories",
  },
  {
    id: "trade-leads",
    label: "Trade Leads",
    icon: TrendingUp,
    href: "/trade-leads",
  },
  {
    id: "payments-wallet",
    label: "Payments & Wallet",
    icon: Wallet,
    href: "/payments-wallet",
  },
  {
    id: "investments",
    label: "Investments",
    icon: PiggyBank,
    href: "/investments",
  },
  {
    id: "consulting",
    label: "Consulting",
    icon: MessageSquare,
    href: "/consulting",
  },
  {
    id: "content-ads",
    label: "Content & Ads",
    icon: Megaphone,
    href: "/content-ads"
  },
  {
    id: "disputes",
    label: "Disputes",
    icon: AlertTriangle,
    href: "/disputes"
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];