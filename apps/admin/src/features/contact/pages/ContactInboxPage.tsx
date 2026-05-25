import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, MessageSquareText, RefreshCw, Search } from "lucide-react";
import {
  getAdminContactInquiries,
  updateAdminContactInquiryStatus,
  type AdminContactInquiry,
  type AdminContactInquiryStatus,
} from "../api/contact.api";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContactInboxPage() {
  const [items, setItems] = useState<AdminContactInquiry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AdminContactInquiryStatus>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    fresh: 0,
    reviewed: 0,
    closed: 0,
  });
  const pageSize = 10;

  async function loadInquiries() {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit: pageSize,
        search,
      };

      if (status !== "all") {
        params.status = status;
      }

      const [response, totalResponse, freshResponse, reviewedResponse, closedResponse] =
        await Promise.all([
          getAdminContactInquiries(params),
          getAdminContactInquiries({ page: 1, limit: 1 }),
          getAdminContactInquiries({ page: 1, limit: 1, status: "new" }),
          getAdminContactInquiries({ page: 1, limit: 1, status: "reviewed" }),
          getAdminContactInquiries({ page: 1, limit: 1, status: "closed" }),
        ]);

      setItems(response.data);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalRows(response.meta?.total || 0);
      setStatusCounts({
        total: totalResponse.meta?.total || 0,
        fresh: freshResponse.meta?.total || 0,
        reviewed: reviewedResponse.meta?.total || 0,
        closed: closedResponse.meta?.total || 0,
      });
      setSelectedId((current) =>
        response.data.some((item) => item.id === current) ? current : response.data[0]?.id || ""
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInquiries();
  }, [page, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId]
  );

  async function handleStatusChange(nextStatus: AdminContactInquiryStatus) {
    if (!selected) return;

    setUpdating(nextStatus);
    try {
      await updateAdminContactInquiryStatus(selected.id, nextStatus);
      await loadInquiries();
    } finally {
      setUpdating("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard label="Total inquiries" value={String(statusCounts.total)} />
        <MetricCard label="New" value={String(statusCounts.fresh)} />
        <MetricCard label="Reviewed" value={String(statusCounts.reviewed)} />
        <MetricCard label="Closed" value={String(statusCounts.closed)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className={surface}>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-black/45">Support inbox</p>
              <h1 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                Contact inquiries
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
                {([
                  ["all", "All"],
                  ["new", "New"],
                  ["reviewed", "Reviewed"],
                  ["closed", "Closed"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    className={[
                      "rounded-full px-4 py-2 font-medium transition",
                      status === value ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void loadInquiries()}
                className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          <label className="mt-4 flex h-12 items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 text-black/35">
            <Search className="h-4 w-4" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sender, email, subject, message"
              className="w-full bg-transparent text-sm text-black outline-none placeholder:text-black/35"
            />
          </label>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
              Loading inquiries...
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f7f7f8] text-black/48">
                  <tr>
                    <th className="px-5 py-4 font-medium">Sender</th>
                    <th className="px-5 py-4 font-medium">Subject</th>
                    <th className="px-5 py-4 font-medium">Received</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-sm text-black/45">
                        No contact inquiries found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={[
                          "cursor-pointer border-t border-black/6 transition hover:bg-[#fafafa]",
                          selected?.id === item.id ? "bg-[#fafafa]" : "",
                        ].join(" ")}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-black">{item.name}</p>
                          <p className="mt-1 text-sm text-black/42">{item.email}</p>
                        </td>
                        <td className="px-5 py-4 text-black/72">{item.subject}</td>
                        <td className="px-5 py-4 text-black/42">{formatDate(item.createdAt)}</td>
                        <td className="px-5 py-4">
                          <StatusPill status={item.status} />
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

        <section className={surface}>
          {selected ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black/45">Selected inquiry</p>
                  <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                    {selected.name}
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <InfoRow label="Email" value={selected.email} />
                <InfoRow label="Subject" value={selected.subject} />
                <InfoRow label="Source" value={selected.source} />
                <InfoRow label="Created" value={formatDate(selected.createdAt)} />
              </div>

              <div className="mt-8 rounded-[24px] bg-[#f7f7f8] p-5">
                <div className="flex items-center gap-3">
                  <MessageSquareText className="h-4 w-4 text-black/45" />
                  <p className="text-sm font-medium text-black/45">Message</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-black/72">{selected.message}</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {(["new", "reviewed", "closed"] as const).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() => void handleStatusChange(nextStatus)}
                    disabled={updating === nextStatus || selected.status === nextStatus}
                    className={[
                      "inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition disabled:opacity-60",
                      selected.status === nextStatus
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-black hover:bg-black hover:text-white",
                    ].join(" ")}
                  >
                    {updating === nextStatus ? "Updating..." : `Mark ${nextStatus}`}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
              Select an inquiry to read the full message.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <section className={surface}>
      <p className="text-sm font-medium text-black/45">{label}</p>
      <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">{value}</p>
      <p className="mt-2 text-sm text-black/42">Live support intake</p>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/8 bg-[#f7f7f8] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-black/35">{label}</p>
      <p className="mt-2 text-sm font-medium text-black">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: AdminContactInquiryStatus }) {
  const className =
    status === "closed"
      ? "bg-slate-200 text-slate-700"
      : status === "reviewed"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{status}</span>;
}
