import { Customer } from "../customers/customer.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createHttpError } from "../../utils/createHttpError.js";
import {
  commitCustomerOrderStats,
  createCheckoutOrder,
  expireOrderIfNeeded,
  findOrderByTxnRef,
  generateVnpayTxnRef,
  markOrderFailed,
  markOrderPaid,
  releaseOrderInventory,
  sanitizeOrder,
} from "../orders/order.service.js";
import {
  buildFrontendResultUrl,
  buildVnpayPaymentUrl,
  formatVnpDate,
  getClientIp,
  getVnpayConfig,
  normalizeOrderInfo,
  verifyVnpaySignature,
} from "./vnpay.utils.js";

function isVnpaySuccess(params) {
  return params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
}

function applyVnpayResponseToOrder(order, params) {
  order.paymentMeta = {
    ...(order.paymentMeta?.toObject?.() || order.paymentMeta || {}),
    provider: "vnpay",
    txnRef: order.paymentMeta?.txnRef || params.vnp_TxnRef || "",
    paymentUrl: order.paymentMeta?.paymentUrl || "",
    expiresAt: order.paymentMeta?.expiresAt || null,
    requestedBankCode: order.paymentMeta?.requestedBankCode || "",
    transactionNo: String(params.vnp_TransactionNo || "").trim(),
    bankCode: String(params.vnp_BankCode || "").trim().toUpperCase(),
    bankTranNo: String(params.vnp_BankTranNo || "").trim(),
    cardType: String(params.vnp_CardType || "").trim().toUpperCase(),
    payDate: String(params.vnp_PayDate || "").trim(),
    responseCode: String(params.vnp_ResponseCode || "").trim(),
    transactionStatus: String(params.vnp_TransactionStatus || "").trim(),
    lastUpdatedAt: new Date(),
  };
}

export const createVnpayPayment = asyncHandler(async (req, res) => {
  const config = getVnpayConfig();
  const requestedBankCode = String(req.body.bankCode || "").trim().toUpperCase();
  const locale = String(req.body.language || config.locale).trim() || config.locale;
  const txnRef = generateVnpayTxnRef();

  const { order } = await createCheckoutOrder({
    customerPayload: req.body.customer || {},
    shippingAddress: req.body.shippingAddress || {},
    paymentMethod: "vnpay",
    items: req.body.items,
    shippingMethodId: req.body.shippingMethodId,
    note: req.body.note,
    authenticatedCustomer: req.customer || null,
    paymentMeta: {
      provider: "vnpay",
      txnRef,
      requestedBankCode,
      lastUpdatedAt: new Date(),
    },
  });

  const createDate = new Date();
  const expiresAt = new Date(createDate.getTime() + config.expireMinutes * 60 * 1000);
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: order.totalAmount * 100,
    vnp_CreateDate: formatVnpDate(createDate),
    vnp_CurrCode: "VND",
    vnp_IpAddr: getClientIp(req),
    vnp_Locale: locale,
    vnp_OrderInfo: normalizeOrderInfo(`Thanh toan don hang CyberShop ${order.orderCode}`),
    vnp_OrderType: config.orderType,
    vnp_ReturnUrl: config.returnUrl,
    vnp_TxnRef: txnRef,
    vnp_ExpireDate: formatVnpDate(expiresAt),
  };

  if (requestedBankCode) {
    params.vnp_BankCode = requestedBankCode;
  }

  const paymentUrl = buildVnpayPaymentUrl(config.paymentUrl, config.hashSecret, params);

  order.paymentMeta = {
    ...(order.paymentMeta?.toObject?.() || order.paymentMeta || {}),
    provider: "vnpay",
    txnRef,
    paymentUrl,
    expiresAt,
    requestedBankCode,
    lastUpdatedAt: new Date(),
  };
  await order.save();

  res.status(201).json({
    success: true,
    message: "VNPay payment created successfully",
    data: {
      order: sanitizeOrder(order),
      paymentUrl,
      txnRef,
      expiresAt,
    },
  });
});

export const handleVnpayIpn = asyncHandler(async (req, res) => {
  const config = getVnpayConfig();
  const { params, isValid } = verifyVnpaySignature(req.query, config.hashSecret);

  if (!isValid) {
    res.status(200).json({ RspCode: "97", Message: "Invalid checksum" });
    return;
  }

  const txnRef = String(params.vnp_TxnRef || "").trim().toUpperCase();
  const order = await findOrderByTxnRef(txnRef);

  if (!order || order.paymentMethod !== "vnpay") {
    res.status(200).json({ RspCode: "01", Message: "Order not found" });
    return;
  }

  const paidAmount = Number(params.vnp_Amount || 0) / 100;

  if (paidAmount !== order.totalAmount) {
    res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    return;
  }

  if (["paid", "failed"].includes(order.paymentStatus)) {
    res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
    return;
  }

  applyVnpayResponseToOrder(order, params);

  if (!isVnpaySuccess(params)) {
    await markOrderFailed(order);
    await releaseOrderInventory(order);
    res.status(200).json({ RspCode: "00", Message: "Success" });
    return;
  }

  const customer = order.customerId ? await Customer.findById(order.customerId) : null;

  if (!customer) {
    throw createHttpError(404, "Customer not found for VNPay order");
  }

  await markOrderPaid(order);
  await commitCustomerOrderStats(order, customer);

  res.status(200).json({ RspCode: "00", Message: "Success" });
});

export const handleVnpayReturn = asyncHandler(async (req, res) => {
  const config = getVnpayConfig();
  const { params, isValid } = verifyVnpaySignature(req.query, config.hashSecret);
  const redirectUrl = buildFrontendResultUrl(config.frontendReturnUrl, {
    provider: "vnpay",
    txnRef: params.vnp_TxnRef || "",
    responseCode: params.vnp_ResponseCode || "",
    transactionStatus: params.vnp_TransactionStatus || "",
    result: !isValid ? "invalid" : isVnpaySuccess(params) ? "success" : "failed",
  });

  res.redirect(302, redirectUrl);
});

export const getMyVnpayPaymentStatus = asyncHandler(async (req, res) => {
  const txnRef = String(req.params.txnRef || "").trim().toUpperCase();
  const order = await findOrderByTxnRef(txnRef);

  if (!order || String(order.customerId || "") !== String(req.customer?._id || "")) {
    throw createHttpError(404, "VNPay order not found");
  }

  await expireOrderIfNeeded(order);

  res.json({
    success: true,
    message: "VNPay payment status fetched successfully",
    data: {
      isFinal: ["paid", "failed", "refunded"].includes(order.paymentStatus),
      order: sanitizeOrder(order),
    },
  });
});
