import { useEffect, useState } from "react";
import { Ban, CheckCheck, CircleDollarSign, Search, Truck, X } from "lucide-react";
import { formatCurrencyVnd } from "@shared/formatters/currency";
import { getAdminOrders, updateAdminOrderStatus, type AdminOrder } from "../api/orders.api";
import { resolveAssetUrl } from "@/utils/assets";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

type OrderTab = "all" | "completed" | "pending" | "cancelled";
type PaymentMethodFilter = "all" | "vnpay" | "cod";
type OrderActionKind = "confirm" | "ship" | "deliver" | "cancel";

type OrderActionIntent = {
  order: AdminOrder;
  kind: OrderActionKind;
};

function formatMoney(value: number) {
  return formatCurrencyVnd(value);
}

function getStatusGroup(tab: OrderTab) {
  if (tab === "completed") return "completed";
  if (tab === "pending") return "pending";
  if (tab === "cancelled") return "cancelled";
  return "";
}

function getActionPayload(kind: OrderActionKind) {
  if (kind === "confirm") return { orderStatus: "confirmed" };
  if (kind === "ship") return { orderStatus: "shipping" };
  if (kind === "deliver") return { orderStatus: "delivered" };
  return { orderStatus: "cancelled" };
}

function getActionCopy(intent: OrderActionIntent) {
  const { order, kind } = intent;

  if (kind === "confirm") {
    return {
      title: "Confirm this order?",
      description:
        "Use this when the backoffice has accepted the order and it is ready to move into fulfillment.",
      submitLabel: "Confirm order",
      successMessage: `${order.orderCode} confirmed successfully.`,
    };
  }

  if (kind === "ship") {
    return {
      title: "Mark order as shipping?",
      description:
        "This moves the order into the delivery stage. Payment status will not change at this step.",
      submitLabel: "Start shipping",
      successMessage: `${order.orderCode} moved to shipping.`,
    };
  }

  if (kind === "deliver") {
    return {
      title: "Mark order as delivered?",
      description:
        order.paymentMethod === "cod"
          ? "This confirms handoff to the customer. For COD, payment will also be recorded as paid at this step."
          : "This confirms the shipment reached the customer. For VNPay, payment stays as recorded by the gateway.",
      submitLabel: "Mark delivered",
      successMessage:
        order.paymentMethod === "cod"
          ? `${order.orderCode} delivered. COD payment recorded as paid.`
          : `${order.orderCode} marked as delivered.`,
    };
  }

  return {
    title: "Cancel this order?",
    description:
      "Canceling an order restores its reserved inventory. Use this only when the order should no longer be fulfilled.",
    submitLabel: "Cancel order",
    successMessage: `${order.orderCode} cancelled and inventory restored.`,
  };
}

export default function OrdersListPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<OrderTab>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethodFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [updatingId, setUpdatingId] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<OrderActionIntent | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });

  useEffect(() => {
    async function loadOrderStats() {
      const [allResponse, completedResponse, pendingResponse, cancelledResponse] =
        await Promise.all([
          getAdminOrders({ limit: 1 }),
          getAdminOrders({ limit: 1, orderStatusGroup: "completed" }),
          getAdminOrders({ limit: 1, orderStatusGroup: "pending" }),
          getAdminOrders({ limit: 1, orderStatusGroup: "cancelled" }),
        ]);

      setStats({
        total: allResponse.meta?.total || 0,
        completed: completedResponse.meta?.total || 0,
        pending: pendingResponse.meta?.total || 0,
        cancelled: cancelledResponse.meta?.total || 0,
      });
    }

    void loadOrderStats();
  }, []);

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const response = await getAdminOrders({
          page,
          limit: 8,
          search,
          ...(paymentMethodFilter !== "all" ? { paymentMethod: paymentMethodFilter } : {}),
          ...(getStatusGroup(tab) ? { orderStatusGroup: getStatusGroup(tab) } : {}),
        });

        setOrders(response.data);
        setTotalRows(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, [page, paymentMethodFilter, search, tab]);

  useEffect(() => {
    setPage(1);
  }, [paymentMethodFilter, search, tab]);

  useEffect(() => {
    if (!feedback) return;

    const timeout = window.setTimeout(() => setFeedback(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function refreshCurrentPage() {
    const response = await getAdminOrders({
      page,
      limit: 8,
      search,
      ...(paymentMethodFilter !== "all" ? { paymentMethod: paymentMethodFilter } : {}),
      ...(getStatusGroup(tab) ? { orderStatusGroup: getStatusGroup(tab) } : {}),
    });

    setOrders(response.data);
    setTotalRows(response.meta?.total || 0);
    setTotalPages(response.meta?.totalPages || 1);

    const [allResponse, completedResponse, pendingResponse, cancelledResponse] =
      await Promise.all([
        getAdminOrders({ limit: 1 }),
        getAdminOrders({ limit: 1, orderStatusGroup: "completed" }),
        getAdminOrders({ limit: 1, orderStatusGroup: "pending" }),
        getAdminOrders({ limit: 1, orderStatusGroup: "cancelled" }),
      ]);

    setStats({
      total: allResponse.meta?.total || 0,
      completed: completedResponse.meta?.total || 0,
      pending: pendingResponse.meta?.total || 0,
      cancelled: cancelledResponse.meta?.total || 0,
    });
  }

  async function performOrderAction(intent: OrderActionIntent) {
    const { order, kind } = intent;
    const actionCopy = getActionCopy(intent);

    setUpdatingId(order.id);
    try {
      await updateAdminOrderStatus(order.id, getActionPayload(kind));
      await refreshCurrentPage();
      setFeedback({ tone: "success", message: actionCopy.successMessage });
    } finally {
      setUpdatingId("");
    }
  }

  const summaryCards = [
    { label: "Total Orders", value: stats.total },
    { label: "Pending Orders", value: stats.pending },
    { label: "Completed Orders", value: stats.completed },
    { label: "Cancelled Orders", value: stats.cancelled },
  ];

  return (
    <div className="space-y-6">
      {feedback ? (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={[
              "flex items-center justify-between gap-3 rounded-[20px] border px-4 py-3 text-sm font-medium shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur",
              feedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
                : "border-rose-200 bg-rose-50/95 text-rose-700",
            ].join(" ")}
          >
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-current/15 text-current transition hover:bg-white/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <section key={card.label} className={surface}>
            <div>
              <p className="text-sm font-medium text-black/45">{card.label}</p>
              <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
                {card.value.toLocaleString("en-US")}
              </p>
              <p className="mt-2 text-sm text-black/42">Live operational totals</p>
            </div>
          </section>
        ))}
      </div>

      <section className={surface}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3">
            <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
              {([
                ["all", `All (${stats.total})`],
                ["completed", "Completed"],
                ["pending", "Pending"],
                ["cancelled", "Cancelled"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTab(value)}
                  className={[
                    "rounded-full px-4 py-2 font-medium transition",
                    tab === value ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
              {([
                ["all", "All payments"],
                ["vnpay", "VNPay"],
                ["cod", "COD"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethodFilter(value)}
                  className={[
                    "rounded-full px-4 py-2 font-medium transition",
                    paymentMethodFilter === value
                      ? "bg-white text-black shadow-sm"
                      : "text-black/45 hover:text-black",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order report"
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
            Loading orders...
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f7f8] text-black/48">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-black/45">
                      No orders match the current filter.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const leadItem = order.items[0];
                    const isCancelled = order.orderStatus === "cancelled";
                    const isDelivered = order.orderStatus === "delivered";
                    const canConfirm = order.orderStatus === "pending";
                    const canShip = order.orderStatus === "confirmed";
                    const canDeliver = order.orderStatus === "shipping";

                    return (
                      <tr key={order.id} className="border-t border-black/6 align-top">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-black">{order.orderCode}</p>
                          <p className="mt-1 text-sm text-black/42">{order.customerName}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7f7f8]">
                              {leadItem?.image ? (
                                <img
                                  src={resolveAssetUrl(leadItem.image)}
                                  alt={leadItem.name}
                                  className="max-h-10 object-contain"
                                />
                              ) : null}
                            </div>
                            <div>
                              <p className="font-medium text-black">{leadItem?.name || "Order items"}</p>
                              <p className="mt-1 text-sm text-black/42">{order.items.length} item(s)</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-black/45">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 font-medium text-black">{formatMoney(order.totalAmount)}</td>
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <span className="inline-flex items-center gap-2 text-black/65">
                              <span
                                className={[
                                  "h-2 w-2 rounded-full",
                                  order.paymentStatus === "paid" ? "bg-emerald-500" : "bg-rose-500",
                                ].join(" ")}
                              />
                              {order.paymentStatus}
                            </span>
                            <p className="text-xs uppercase tracking-[0.16em] text-black/35">
                              {order.paymentMethod}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f7f8] px-3 py-2 text-sm font-medium text-black">
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPendingAction({ order, kind: "confirm" })}
                              disabled={updatingId === order.id || !canConfirm || isCancelled || isDelivered}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
                            >
                              <CheckCheck className="mr-2 h-4 w-4" />
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingAction({ order, kind: "ship" })}
                              disabled={updatingId === order.id || !canShip || isCancelled || isDelivered}
                              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:opacity-60"
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              Ship
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingAction({ order, kind: "deliver" })}
                              disabled={updatingId === order.id || !canDeliver || isCancelled || isDelivered}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-emerald-200 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white disabled:opacity-60"
                            >
                              <CircleDollarSign className="mr-2 h-4 w-4" />
                              Delivered
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingAction({ order, kind: "cancel" })}
                              disabled={updatingId === order.id || isCancelled || isDelivered}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-600 hover:text-white disabled:opacity-60"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
          >
            Previous
          </button>
          <p className="text-sm text-black/45">{`Page ${page} of ${totalPages} · ${totalRows} result(s)`}</p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </section>

      {pendingAction ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl rounded-[28px] border border-black/8 bg-white p-7 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">Final confirmation</p>
                <h3 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                  {getActionCopy(pendingAction).title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/55 transition hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-[22px] border border-black/8 bg-[#fafafa] px-5 py-4">
              <p className="text-sm font-medium text-black">{pendingAction.order.orderCode}</p>
              <p className="mt-1 text-sm text-black/45">
                {pendingAction.order.customerName} · {pendingAction.order.items[0]?.name || "Order"}
              </p>
              <p className="mt-1 text-sm text-black/45">
                {pendingAction.order.paymentMethod.toUpperCase()} · {pendingAction.order.paymentStatus} · {pendingAction.order.orderStatus}
              </p>
            </div>

            <p className="mt-5 text-sm leading-7 text-black/65">{getActionCopy(pendingAction).description}</p>

            <div className="mt-7 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Keep current state
              </button>
              <button
                type="button"
                disabled={updatingId === pendingAction.order.id}
                onClick={async () => {
                  try {
                    await performOrderAction(pendingAction);
                    setPendingAction(null);
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : "Unable to update order right now.";
                    setFeedback({ tone: "error", message });
                  }
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-[#1f1f1f] disabled:opacity-60"
              >
                {updatingId === pendingAction.order.id ? "Processing..." : getActionCopy(pendingAction).submitLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
