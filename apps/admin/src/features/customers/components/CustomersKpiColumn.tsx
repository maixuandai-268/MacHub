import { StatCard } from "@/components/data-display/StatCard";
import type { CustomersKpi } from "@/features/customers/types";

type Props = {
  kpi: CustomersKpi;
};

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function CustomersKpiColumn({ kpi }: Props) {
  return (
    <div className="grid gap-4">
      <StatCard
        title="Total Customers"
        value={kpi.totalCustomers.toLocaleString()}
        changeText={`+${kpi.totalCustomersChangePct}%`}
        subtitle="Current base"
      />
      <StatCard
        title="New Customers"
        value={kpi.newCustomers.toLocaleString()}
        changeText={`+${kpi.newCustomersChangePct}%`}
        subtitle="Last 30 days"
      />
      <StatCard
        title="Revenue"
        value={formatCompact(kpi.visitors)}
        changeText={`+${kpi.visitorsChangePct}%`}
        subtitle="Customer spend"
      />
    </div>
  );
}
