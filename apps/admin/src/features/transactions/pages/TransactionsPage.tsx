import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatCurrencyVnd } from '@shared/formatters/currency';
import { getAdminOrders, type AdminOrder } from "@/features/orders/api/orders.api";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

type TransactionTab = "all" | "completed" | "pending" | "failed";

function formatMoney(value: number) {
  return formatCurrencyVnd(value);
}

function getPaymentGroup(tab: TransactionTab) {
  if (tab === "completed") return "completed";
  if (tab === "pending") return "pending";
  if (tab === "failed") return "failed";
  return "";
}

export default function TransactionsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TransactionTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    async function loadTransactionStats() {
      const [allResponse, completedResponse, pendingResponse, failedResponse] =
        await Promise.all([
          getAdminOrders({ limit: 1 }),
          getAdminOrders({ limit: 1, paymentStatusGroup: "completed" }),
          getAdminOrders({ limit: 1, paymentStatusGroup: "pending" }),
          getAdminOrders({ limit: 1, paymentStatusGroup: "failed" }),
        ]);

      setStats({
        total: allResponse.meta?.total || 0,
        completed: completedResponse.meta?.total || 0,
        pending: pendingResponse.meta?.total || 0,
        failed: failedResponse.meta?.total || 0,
      });
    }

    void loadTransactionStats();
  }, []);

  useEffect(() => {
    async function loadTransactions() {
      setLoading(true);
      try {
        const response = await getAdminOrders({
          page,
          limit: 12,
          search,
          ...(getPaymentGroup(tab) ? { paymentStatusGroup: getPaymentGroup(tab) } : {}),
        });

        setOrders(response.data);
        setTotalRows(response.meta?.total || 0);
        setTotalPages(response.meta?.totalPages || 1);
      } finally {
        setLoading(false);
      }
    }

    void loadTransactions();
  }, [page, search, tab]);

  useEffect(() => {
    setPage(1);
  }, [search, tab]);

  const revenue = useMemo(
    () => orders
      .filter((item) => item.paymentStatus === "paid")
      .reduce((sum, item) => sum + item.totalAmount, 0),
    [orders]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.78fr_0.78fr_1.44fr]">
        <MetricCard label="Transactions" value={stats.total.toLocaleString("en-US")} />
        <MetricCard
          label="Completed Payments"
          value={stats.completed.toLocaleString("en-US")}
        />

        <section className={surface}>
          <div>
            <p className="text-sm font-medium text-black/45">Payment health</p>
            <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
              Current state
            </h2>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <SummaryPill label="Pending" value={stats.pending} tone="amber" />
            <SummaryPill label="Failed" value={stats.failed} tone="rose" />
            <SummaryPill label="Visible revenue" value={revenue} tone="dark" isMoney />
          </div>
        </section>
      </div>

      <section className={surface}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
            {([
              ["all", `All (${stats.total})`],
              ["completed", "Completed"],
              ["pending", "Pending"],
              ["failed", "Failed"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={[
                  "rounded-full px-4 py-2 font-medium transition",
                  tab === value
                    ? "bg-white text-black shadow-sm"
                    : "text-black/45 hover:text-black",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payment history"
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
            Loading transactions...
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f7f8] text-black/48">
                <tr>
                  <th className="px-5 py-4 font-medium">Customer</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Method</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                  <th className="px-5 py-4 font-medium">Order</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-black/45">
                      No transactions match the current filter.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-t border-black/6">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-black">{order.customerName}</p>
                        <p className="mt-1 text-sm text-black/42">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-black/42">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 font-medium text-black">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4 text-black/65">{order.paymentMethod}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-2",
                            order.paymentStatus === "paid"
                              ? "text-emerald-600"
                              : order.paymentStatus === "failed"
                                ? "text-rose-600"
                                : "text-amber-600",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-2 w-2 rounded-full",
                              order.paymentStatus === "paid"
                                ? "bg-emerald-500"
                                : order.paymentStatus === "failed"
                                  ? "bg-rose-500"
                                  : "bg-amber-500",
                            ].join(" ")}
                          />
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#f7f7f8] px-3 py-1 text-xs font-semibold text-black">
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
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
          <p className="text-sm text-black/45">
            Page {page} of {totalPages} · {totalRows} result(s)
          </p>
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
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <section className={surface}>
      <p className="text-sm font-medium text-black/45">{label}</p>
      <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">{value}</p>
      <p className="mt-2 text-sm text-black/42">Live payment stream</p>
    </section>
  );
}

function SummaryPill({
  label,
  value,
  tone,
  isMoney = false,
}: {
  label: string;
  value: number;
  tone: "amber" | "rose" | "dark";
  isMoney?: boolean;
}) {
  const formatted = isMoney ? formatMoney(value) : value.toLocaleString("en-US");
  const classes =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "rose"
        ? "bg-rose-50 text-rose-600"
        : "bg-[#f7f7f8] text-black";

  return (
    <div className={`rounded-[24px] p-5 ${classes}`}>
      <p className="text-xs uppercase tracking-[0.18em] opacity-60">{label}</p>
      <p className="mt-3 text-[1.6rem] font-semibold tracking-[-0.04em]">{formatted}</p>
    </div>
  );
}
