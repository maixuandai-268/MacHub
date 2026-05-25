import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { formatCurrencyVnd } from '@shared/formatters/currency';
import { Link, Navigate, useParams } from "react-router-dom";
import { getAdminCustomerDetail, type AdminCustomerDetail } from "../api/customers.api";
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

export default function CustomerDetailsPage() {
  const { id = "" } = useParams();
  const [customer, setCustomer] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadCustomer() {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      try {
        const response = await getAdminCustomerDetail(id);
        setCustomer(response.data);
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status === 404) {
          setNotFound(true);
          setCustomer(null);
        } else {
          throw error;
        }
      } finally {
        setLoading(false);
      }
    }

    void loadCustomer();
  }, [id]);

  const addressSummary = useMemo(() => {
    const address = customer?.addresses?.[0];

    if (!address) {
      return "No address saved yet.";
    }

    return [address.addressLine1, address.city, address.country].filter(Boolean).join(", ");
  }, [customer]);

  if (!id || notFound) {
    return <Navigate to={PATHS.customers} replace />;
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-dashed border-black/10 px-6 py-12 text-center text-sm text-black/45">
        Loading customer profile...
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link
            to={PATHS.customers}
            className="inline-flex items-center gap-2 text-sm font-medium text-black/45 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </Link>
          <h1 className="mt-3 text-[2.4rem] font-semibold tracking-[-0.06em] text-black">
            {customer.name}
          </h1>
          <p className="mt-2 text-sm text-black/45">
            Customer profile, identity details, and recent order history.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Orders" value={String(customer.orderCount)} />
          <StatCard label="Spend" value={formatMoney(customer.totalSpend)} />
          <StatCard label="Last login" value={formatDate(customer.lastLoginAt)} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className={surface}>
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-black text-2xl font-semibold text-white">
              {customer.name.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-black/45">Account status</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                {customer.status}
              </h2>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <InfoPill icon={<Phone className="h-4 w-4" />} text={customer.phone} />
            <InfoPill icon={<Mail className="h-4 w-4" />} text={customer.email || "No email"} />
            <InfoPill
              icon={<ShieldCheck className="h-4 w-4" />}
              text={
                customer.isRegistered
                  ? "Registered customer account"
                  : "Guest-created customer record"
              }
            />
            <InfoPill icon={<MapPin className="h-4 w-4" />} text={addressSummary} />
          </div>

          <div className="mt-8 rounded-[24px] bg-[#f7f7f8] p-5">
            <p className="text-sm font-medium text-black/45">Joined</p>
            <p className="mt-2 text-base font-semibold text-black">
              {formatDate(customer.createdAt)}
            </p>
            <p className="mt-4 text-sm leading-7 text-black/58">
              Keep this page as the first stop for customer support before checking orders,
              payment status, or saved addresses elsewhere in admin.
            </p>
          </div>
        </section>

        <section className={surface}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-black/45">Recent orders</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">
                Latest order flow
              </h2>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/8">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f7f7f8] text-black/48">
                <tr>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Order</th>
                  <th className="px-5 py-4 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody>
                {customer.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-black/45">
                      No recent orders for this customer yet.
                    </td>
                  </tr>
                ) : (
                  customer.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-black/6">
                      <td className="px-5 py-4 font-semibold text-black">{order.orderCode}</td>
                      <td className="px-5 py-4 text-black/42">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4 font-medium text-black">
                        {formatMoney(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[#f7f7f8] px-3 py-1 text-xs font-semibold text-black">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                            order.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : order.paymentStatus === "failed"
                                ? "bg-rose-100 text-rose-600"
                                : "bg-amber-100 text-amber-700",
                          ].join(" ")}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[20px] bg-white px-4 py-4 text-center shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
      <p className="text-xs uppercase tracking-[0.18em] text-black/35">{label}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-black">{value}</p>
    </article>
  );
}
