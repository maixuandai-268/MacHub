import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, ShieldCheck } from "lucide-react";
import { formatCurrencyVnd } from '@shared/formatters/currency';
import { Link } from "react-router-dom";
import { getAdminCustomers, type AdminCustomer } from "../api/customers.api";
import { PATHS } from "@/app/router/paths";

const surface =
  "rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)]";

function formatMoney(value: number) {
  return formatCurrencyVnd(value);
}

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CustomersListPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [registeredCustomers, setRegisteredCustomers] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [vipCustomers, setVipCustomers] = useState(0);
  const [recentCustomers, setRecentCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 9;

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const [
          customerResponse,
          totalResponse,
          registeredResponse,
          activeResponse,
          vipResponse,
          recentResponse,
        ] = await Promise.all([
          getAdminCustomers({ page, limit: pageSize }),
          getAdminCustomers({ page: 1, limit: 1 }),
          getAdminCustomers({ page: 1, limit: 1, isRegistered: "true" }),
          getAdminCustomers({ page: 1, limit: 1, status: "active" }),
          getAdminCustomers({ page: 1, limit: 1, status: "vip" }),
          getAdminCustomers({ page: 1, limit: 1, recentDays: 30 }),
        ]);

        setCustomers(customerResponse.data);
        setTotalPages(customerResponse.meta?.totalPages || 1);
        setTotalCustomers(totalResponse.meta?.total || 0);
        setRegisteredCustomers(registeredResponse.meta?.total || 0);
        setActiveCustomers(activeResponse.meta?.total || 0);
        setVipCustomers(vipResponse.meta?.total || 0);
        setRecentCustomers(recentResponse.meta?.total || 0);
        setSelectedId((current) =>
          customerResponse.data.some((item) => item.id === current) ? current : customerResponse.data[0]?.id || ""
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCustomers();
  }, [page]);

  const rows = customers;
  const selectedCustomer = useMemo(
    () => customers.find((item) => item.id === selectedId) || customers[0] || null,
    [customers, selectedId]
  );

  const overviewSeries = [
    activeCustomers,
    registeredCustomers,
    totalCustomers,
    recentCustomers,
    vipCustomers,
    activeCustomers,
  ];
  const maxPoint = Math.max(...overviewSeries, 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.4fr]">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          <StatCard
            label="Total Customers"
            value={totalCustomers.toLocaleString("en-US")}
          />
          <StatCard
            label="Registered Accounts"
            value={registeredCustomers.toLocaleString("en-US")}
          />
          <StatCard label="VIP Customers" value={vipCustomers.toLocaleString("en-US")} />
        </div>

        <section className={surface}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black/45">Customer Overview</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                Account activity
              </h2>
            </div>
            <div className="inline-flex rounded-full bg-[#f5f5f5] p-1 text-sm">
              <span className="rounded-full bg-white px-4 py-2 font-semibold text-black shadow-sm">
                This week
              </span>
              <span className="px-4 py-2 text-black/45">Last week</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <MiniMetric
              label="Active Customers"
              value={activeCustomers.toLocaleString("en-US")}
            />
            <MiniMetric
              label="Registered"
              value={registeredCustomers.toLocaleString("en-US")}
            />
            <MiniMetric
              label="Shop Visitor"
              value={totalCustomers.toLocaleString("en-US")}
            />
            <MiniMetric
              label="Conversion Rate"
              value={`${
                totalCustomers
                  ? Math.round((registeredCustomers / totalCustomers) * 100)
                  : 0
              }%`}
            />
          </div>

          <div className="mt-8 grid h-[280px] grid-cols-6 items-end gap-4 rounded-[24px] bg-[#f7f7f8] px-5 pb-6 pt-10">
            {overviewSeries.map((value, index) => (
              <div key={`${value}-${index}`} className="flex h-full flex-col justify-end gap-3">
                <div className="flex-1 rounded-t-[22px] bg-white/70 p-[1px]">
                  <div className="flex h-full items-end rounded-t-[21px] bg-[#f7f7f8] px-2 pb-2">
                    <div
                      className="w-full rounded-[16px] bg-[linear-gradient(180deg,#111,#6b7280)]"
                      style={{ height: Math.max(18, Math.round((value / maxPoint) * 200)) }}
                    />
                  </div>
                </div>
                <p className="text-center text-xs uppercase tracking-[0.18em] text-black/35">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <section className={surface}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black/45">Customer Details</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                Customer list
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
              Loading customers...
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f7f7f8] text-black/48">
                  <tr>
                    <th className="px-5 py-4 font-medium">Customer</th>
                    <th className="px-5 py-4 font-medium">Phone</th>
                    <th className="px-5 py-4 font-medium">Orders</th>
                    <th className="px-5 py-4 font-medium">Total Spend</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-black/45">
                        No customer accounts available yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((customer) => (
                      <tr
                        key={customer.id}
                        className={[
                          "cursor-pointer border-t border-black/6 transition hover:bg-[#fafafa]",
                          selectedCustomer?.id === customer.id ? "bg-[#fafafa]" : "",
                        ].join(" ")}
                        onClick={() => setSelectedId(customer.id)}
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-black">{customer.name}</p>
                          <p className="mt-1 text-sm text-black/42">
                            {customer.email || "No email"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-black/65">{customer.phone}</td>
                        <td className="px-5 py-4 font-medium text-black">
                          {customer.orderCount}
                        </td>
                        <td className="px-5 py-4 font-medium text-black">
                          {formatMoney(customer.totalSpend)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                              customer.status === "vip"
                                ? "bg-amber-100 text-amber-700"
                                : customer.status === "inactive"
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-emerald-100 text-emerald-700",
                            ].join(" ")}
                          >
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-black/42">
                          {formatDate(customer.createdAt)}
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
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages })
                .slice(0, 5)
                .map((_, index) => {
                  const pageWindowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const pageNumber = pageWindowStart + index;
                  if (pageNumber > totalPages) return null;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={[
                        "h-11 min-w-11 rounded-xl px-3 text-sm font-semibold transition",
                        page === pageNumber
                          ? "bg-black text-white"
                          : "border border-black/10 text-black/65 hover:bg-black hover:text-white",
                      ].join(" ")}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </section>

        <section className={surface}>
          {selectedCustomer ? (
            <>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                  {selectedCustomer.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-[2rem] font-semibold tracking-[-0.05em] text-black">
                    {selectedCustomer.name}
                  </h2>
                  <p className="mt-1 text-sm text-black/45">
                    {selectedCustomer.email || "No email linked"}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <InfoPill icon={<Phone className="h-4 w-4" />} text={selectedCustomer.phone} />
                <InfoPill
                  icon={<Mail className="h-4 w-4" />}
                  text={selectedCustomer.email || "No email"}
                />
                <InfoPill
                  icon={<ShieldCheck className="h-4 w-4" />}
                  text={
                    selectedCustomer.isRegistered
                      ? "Registered customer account"
                      : "Guest-created customer record"
                  }
                />
              </div>

              <div className="mt-8 rounded-[24px] bg-[#f7f7f8] p-5">
                <p className="text-sm font-medium text-black/45">Primary address</p>
                <p className="mt-3 text-sm leading-7 text-black/68">
                  {selectedCustomer.addresses[0]
                    ? `${selectedCustomer.addresses[0].addressLine1}, ${selectedCustomer.addresses[0].city}, ${selectedCustomer.addresses[0].country}`
                    : "No address saved yet."}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <StatusMiniCard
                  label="Orders"
                  value={String(selectedCustomer.orderCount)}
                  tone="dark"
                />
                <StatusMiniCard
                  label="Spend"
                  value={formatMoney(selectedCustomer.totalSpend)}
                  tone="dark"
                />
                <StatusMiniCard
                  label="Last Login"
                  value={formatDate(selectedCustomer.lastLoginAt)}
                  tone="dark"
                />
              </div>

              <Link
                to={PATHS.customerDetail(selectedCustomer.id)}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl border border-black/10 px-5 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
              >
                Open full profile
              </Link>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <section className={surface}>
      <p className="text-sm font-medium text-black/45">{label}</p>
      <p className="mt-5 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
        {value}
      </p>
      <p className="mt-2 text-sm text-black/42">Live customer account data</p>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[22px] bg-[#f7f7f8] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-black/35">{label}</p>
      <p className="mt-4 text-[1.8rem] font-semibold tracking-[-0.05em] text-black">
        {value}
      </p>
    </article>
  );
}

function InfoPill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-black/8 bg-[#f7f7f8] px-4 py-3 text-sm text-black/72">
      <span className="text-black/45">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StatusMiniCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "dark" | "light";
}) {
  return (
    <article
      className={[
        "rounded-[20px] p-4",
        tone === "dark" ? "bg-black text-white" : "bg-[#f7f7f8] text-black",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs uppercase tracking-[0.18em]",
          tone === "dark" ? "text-white/45" : "text-black/35",
        ].join(" ")}
      >
        {label}
      </p>
      <p className="mt-3 text-sm font-semibold leading-6">{value}</p>
    </article>
  );
}
