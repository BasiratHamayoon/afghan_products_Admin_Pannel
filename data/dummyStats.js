export const dashboardStats = [
    { id: 1, title: "Total Users", value: 12450, change: "+12.5%", changeType: "increase", icon: "Users" },
    { id: 2, title: "Total Products", value: 3280, change: "+8.2%", changeType: "increase", icon: "Package" },
    { id: 3, title: "Revenue", value: 2400000, change: "+15.3%", changeType: "increase", icon: "DollarSign" },
    { id: 4, title: "Active Orders", value: 856, change: "-2.1%", changeType: "decrease", icon: "ShoppingCart" },
    { id: 5, title: "Pending Verifications", value: 24, change: "+5", changeType: "increase", icon: "ShieldCheck" },
    { id: 6, title: "Trade Leads", value: 1245, change: "+18.7%", changeType: "increase", icon: "TrendingUp" },
    { id: 7, title: "Wallet Balance", value: 450000, change: "+22.1%", changeType: "increase", icon: "Wallet" },
    { id: 8, title: "Open Disputes", value: 7, change: "-3", changeType: "decrease", icon: "AlertTriangle" },
  ];
  
  export const revenueData = [
    { month: "Jan", revenue: 180000, orders: 120 },
    { month: "Feb", revenue: 220000, orders: 145 },
    { month: "Mar", revenue: 195000, orders: 130 },
    { month: "Apr", revenue: 310000, orders: 190 },
    { month: "May", revenue: 280000, orders: 175 },
    { month: "Jun", revenue: 350000, orders: 210 },
    { month: "Jul", revenue: 420000, orders: 250 },
    { month: "Aug", revenue: 380000, orders: 230 },
    { month: "Sep", revenue: 450000, orders: 270 },
    { month: "Oct", revenue: 520000, orders: 310 },
    { month: "Nov", revenue: 480000, orders: 290 },
    { month: "Dec", revenue: 600000, orders: 350 },
  ];
  
  export const userGrowthData = [
    { month: "Jan", users: 8500, sellers: 1200 },
    { month: "Feb", users: 8900, sellers: 1350 },
    { month: "Mar", users: 9200, sellers: 1400 },
    { month: "Apr", users: 9800, sellers: 1550 },
    { month: "May", users: 10200, sellers: 1650 },
    { month: "Jun", users: 10800, sellers: 1800 },
    { month: "Jul", users: 11200, sellers: 1950 },
    { month: "Aug", users: 11600, sellers: 2050 },
    { month: "Sep", users: 11900, sellers: 2150 },
    { month: "Oct", users: 12100, sellers: 2280 },
    { month: "Nov", users: 12300, sellers: 2350 },
    { month: "Dec", users: 12450, sellers: 2450 },
  ];
  
  export const categoryDistribution = [
    { name: "Saffron", value: 35, color: "#0F69B0" },
    { name: "Carpets", value: 25, color: "#22c55e" },
    { name: "Dry Fruits", value: 20, color: "#f59e0b" },
    { name: "Gemstones", value: 12, color: "#8b5cf6" },
    { name: "Others", value: 8, color: "#ec4899" },
  ];
  
  export const recentTransactions = [
    { id: "TXN-1001", user: "Ahmad Khan", amount: 15000, status: "completed", date: "2 min ago", type: "purchase" },
    { id: "TXN-1002", user: "Sara Ahmadi", amount: 8500, status: "pending", date: "15 min ago", type: "withdrawal" },
    { id: "TXN-1003", user: "Mohammad Ali", amount: 25000, status: "completed", date: "1 hour ago", type: "purchase" },
    { id: "TXN-1004", user: "Fatima Noori", amount: 12000, status: "failed", date: "2 hours ago", type: "refund" },
    { id: "TXN-1005", user: "Karim Stanikzai", amount: 45000, status: "completed", date: "3 hours ago", type: "purchase" },
    { id: "TXN-1006", user: "Zainab Rahimi", amount: 6800, status: "pending", date: "4 hours ago", type: "withdrawal" },
  ];
  
  export const recentUsers = [
    { id: 1, name: "Ahmad Khan", email: "ahmad@mail.com", role: "seller", status: "active", joined: "Today" },
    { id: 2, name: "Sara Ahmadi", email: "sara@mail.com", role: "buyer", status: "active", joined: "Today" },
    { id: 3, name: "Mohammad Ali", email: "mali@mail.com", role: "seller", status: "pending", joined: "Yesterday" },
    { id: 4, name: "Fatima Noori", email: "fatima@mail.com", role: "buyer", status: "active", joined: "Yesterday" },
    { id: 5, name: "Karim Stanikzai", email: "karim@mail.com", role: "seller", status: "suspended", joined: "2 days ago" },
  ];
  
  export const topProducts = [
    { id: 1, name: "Premium Afghan Saffron", sales: 450, revenue: 675000, growth: "+25%" },
    { id: 2, name: "Hand-Woven Carpet", sales: 280, revenue: 980000, growth: "+18%" },
    { id: 3, name: "Organic Pine Nuts", sales: 620, revenue: 310000, growth: "+32%" },
    { id: 4, name: "Lapis Lazuli Pendant", sales: 180, revenue: 540000, growth: "+12%" },
    { id: 5, name: "Afghan Green Raisins", sales: 890, revenue: 267000, growth: "+45%" },
  ];
  
  export const quickActions = [
    { label: "Approve Products", count: 12, color: "bg-blue-500" },
    { label: "Verify Sellers", count: 8, color: "bg-green-500" },
    { label: "Resolve Disputes", count: 3, color: "bg-red-500" },
    { label: "Process Withdrawals", count: 5, color: "bg-purple-500" },
    { label: "Review Trade Leads", count: 15, color: "bg-orange-500" },
  ];