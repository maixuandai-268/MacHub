import { Customer } from "./customer.model.js";
import { Order } from "../orders/order.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";

function sanitizeCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    isRegistered: customer.isRegistered,
    status: customer.status,
    totalSpend: customer.totalSpend,
    orderCount: customer.orderCount,
    addresses: customer.addresses,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();
  const recentDays = Number(req.query.recentDays || 0);
  const filter = {};
  const isRegistered =
    req.query.isRegistered === undefined
      ? undefined
      : String(req.query.isRegistered) === "true";

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (typeof isRegistered === "boolean") {
    filter.isRegistered = isRegistered;
  }

  if (recentDays > 0) {
    const since = new Date();
    since.setDate(since.getDate() - recentDays);
    filter.createdAt = { $gte: since };
  }

  const [items, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Customer.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Customers fetched successfully",
    data: items.map(sanitizeCustomer),
    meta: buildMeta(page, limit, total),
  });
});

export const getCustomerDetail = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    throw createHttpError(404, "Customer not found");
  }

  const recentOrders = await Order.find({ customerId: customer._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderCode orderStatus paymentStatus totalAmount createdAt");

  res.json({
    success: true,
    message: "Customer fetched successfully",
    data: {
      ...sanitizeCustomer(customer),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderCode: order.orderCode,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      })),
    },
  });
});
