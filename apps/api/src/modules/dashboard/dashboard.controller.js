import { Category } from "../categories/category.model.js";
import { Customer } from "../customers/customer.model.js";
import { Order } from "../orders/order.model.js";
import { Product } from "../products/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { expireStalePendingVnpayOrders } from "../orders/order.service.js";

const DASHBOARD_TIMEZONE = "Asia/Ho_Chi_Minh";

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function formatDateInTimezone(date, timeZone = DASHBOARD_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(date);
}

function buildRecentDateLabels(days, now = new Date(), timeZone = DASHBOARD_TIMEZONE) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (days - index - 1));
    return formatDateInTimezone(date, timeZone);
  });
}

function scheduleDashboardInventoryCleanup() {
  void expireStalePendingVnpayOrders().catch(() => {
    // Dashboard reads should not block while stale VNPay orders are being reconciled.
  });
}

export const getDashboardSummary = asyncHandler(async (_req, res) => {
  scheduleDashboardInventoryCleanup();

  const now = new Date();
  const sevenDaysAgo = getDateDaysAgo(6);
  const thirtyDaysAgo = getDateDaysAgo(30);
  const validOrderFilter = {
    orderStatus: { $ne: "cancelled" },
    paymentStatus: { $ne: "failed" },
  };
  const paidOrderFilter = {
    orderStatus: { $ne: "cancelled" },
    paymentStatus: "paid",
  };

  const [
    totalProducts,
    totalCategories,
    totalCustomers,
    newCustomersLast30Days,
    totalOrders,
    recentOrders,
    revenueResult,
    topProducts,
    pendingOrders,
    cancelledOrders,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments({ isActive: true }),
    Customer.countDocuments(),
    Customer.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Order.countDocuments(validOrderFilter),
    Order.find(validOrderFilter).sort({ createdAt: -1 }).limit(5),
    Order.aggregate([
      {
        $match: paidOrderFilter,
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: paidOrderFilter,
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 },
    ]),
    Order.countDocuments({
      paymentStatus: { $ne: "failed" },
      orderStatus: { $in: ["pending", "confirmed", "shipping"] },
    }),
    Order.countDocuments({
      orderStatus: "cancelled",
    }),
  ]);

  const recentRevenueRaw = await Order.aggregate([
    {
      $match: {
        ...paidOrderFilter,
        createdAt: { $gte: sevenDaysAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: DASHBOARD_TIMEZONE,
          },
        },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentDateLabels = buildRecentDateLabels(7, now, DASHBOARD_TIMEZONE);
  const revenueByDate = new Map(recentRevenueRaw.map((item) => [item._id, item.revenue]));
  const recentRevenue = recentDateLabels.map((dateLabel) => ({
    _id: dateLabel,
    revenue: revenueByDate.get(dateLabel) || 0,
  }));

  res.json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data: {
      overview: {
        totalProducts,
        totalCategories,
        totalCustomers,
        newCustomersLast30Days,
        totalOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue: revenueResult[0]?.revenue || 0,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderCode: order.orderCode,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      })),
      topProducts,
      recentRevenue,
    },
  });
});
