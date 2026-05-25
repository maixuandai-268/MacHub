import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, History, Search } from "lucide-react";
import { getAdminInventoryLogs, type InventoryLog } from "../api/inventory.api";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

function formatDelta(delta: number) {
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function formatReason(reason: string) {
  return reason
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function InventoryPage() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [inventoryEvents, setInventoryEvents] = useState(0);
  const [stockOutEvents, setStockOutEvents] = useState(0);
  const [restoredEvents, setRestoredEvents] = useState(0);
  const [reasonOptions, setReasonOptions] = useState<string[]>(["all"]);
  const pageSize = 10;

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const logParams: Record<string, string | number> = {
          page,
          limit: pageSize,
          search,
        };

        if (reason !== "all") {
          logParams.reason = reason;
        }

        const [response, allResponse, stockOutResponse, restoredResponse, reasonResponse] =
          await Promise.all([
            getAdminInventoryLogs(logParams),
            getAdminInventoryLogs({ page: 1, limit: 1 }),
            getAdminInventoryLogs({ page: 1, limit: 1, nextStockZero: "true" }),
            getAdminInventoryLogs({ page: 1, limit: 1, deltaType: "positive" }),
            getAdminInventoryLogs({ page: 1, limit: 100 }),
          ]);

        setLogs(response.data);
        setTotalPages(response.meta?.totalPages || 1);
        setTotalRows(response.meta?.total || 0);
        setInventoryEvents(allResponse.meta?.total || 0);
        setStockOutEvents(stockOutResponse.meta?.total || 0);
        setRestoredEvents(restoredResponse.meta?.total || 0);
        setReasonOptions(["all", ...new Set(reasonResponse.data.map((item) => item.reason))]);
      } finally {
        setLoading(false);
      }
    }

    void loadLogs();
  }, [page, reason, search]);

  useEffect(() => {
    setPage(1);
  }, [reason, search]);

  const reasons = useMemo(() => reasonOptions, [reasonOptions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <section className={surface}>
          <p className="text-sm font-medium text-black/45">Inventory events</p>
          <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
            {inventoryEvents.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-sm text-black/42">Every stock mutation is logged here.</p>
        </section>
        <section className={surface}>
          <p className="text-sm font-medium text-black/45">Stock out events</p>
          <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
            {stockOutEvents.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-sm text-black/42">Products that reached zero stock.</p>
        </section>
        <section className={surface}>
          <p className="text-sm font-medium text-black/45">Restocks & returns</p>
          <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
            {restoredEvents.toLocaleString("en-US")}
          </p>
          <p className="mt-2 text-sm text-black/42">Manual restocks and cancelled-order returns.</p>
        </section>
      </div>

      <section className={surface}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
            {reasons.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value)}
                className={[
                  "rounded-full px-4 py-2 font-medium transition",
                  reason === value ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black",
                ].join(" ")}
              >
                {value === "all" ? "All activity" : formatReason(value)}
              </button>
            ))}
          </div>

          <label className="flex h-12 min-w-[280px] items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU, order code"
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
            />
          </label>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
            Loading inventory activity...
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f7f8] text-black/48">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Reason</th>
                  <th className="px-5 py-4 font-medium">Delta</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Actor</th>
                  <th className="px-5 py-4 font-medium">Reference</th>
                  <th className="px-5 py-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-black/45">
                      No inventory activity matches the current filter.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-t border-black/6">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-black">{log.productName}</p>
                        <p className="mt-1 text-sm text-black/42">{log.sku}</p>
                      </td>
                      <td className="px-5 py-4 text-black/65">{formatReason(log.reason)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            log.delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600",
                          ].join(" ")}
                        >
                          {formatDelta(log.delta)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-black/65">
                        {log.previousStock} {"->"} {log.nextStock}
                      </td>
                      <td className="px-5 py-4 text-black/45">{log.actorType}</td>
                      <td className="px-5 py-4 text-black/45">
                        {log.referenceCode || (
                          <span className="inline-flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-black/45">{new Date(log.createdAt).toLocaleString()}</td>
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
            disabled={page <= 1}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </button>
          <p className="text-sm text-black/45">
            Page {page} of {totalPages} · {totalRows} result(s)
          </p>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white disabled:opacity-40"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
