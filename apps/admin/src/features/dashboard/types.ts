export type DashboardOverview = {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  newCustomersLast30Days: number;
  totalOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
};

export type DashboardRecentOrder = {
  id: string;
  orderCode: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
};

export type DashboardTopProduct = {
  _id: string;
  name: string;
  quantitySold: number;
  revenue: number;
};

export type DashboardRevenuePoint = {
  _id: string;
  revenue: number;
};

export type DashboardSummary = {
  overview: DashboardOverview;
  recentOrders: DashboardRecentOrder[];
  topProducts: DashboardTopProduct[];
  recentRevenue: DashboardRevenuePoint[];
};
