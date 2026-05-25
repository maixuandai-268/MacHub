import type { CustomerStatus } from "@/features/customers/types";

type Props = {
  status: CustomerStatus;
};

export function StatusPill({ status }: Props) {
  const map: Record<CustomerStatus, { dot: string; text: string; label: string }> = {
    active: { dot: "bg-slate-900", text: "text-slate-700", label: "Active" },
    inactive: { dot: "bg-red-500", text: "text-red-500", label: "Inactive" },
    vip: { dot: "bg-amber-500", text: "text-amber-600", label: "VIP" },
  };

  const s = map[status];

  return (
    <span className={["inline-flex items-center gap-2 text-sm", s.text].join(" ")}>
      <span className={["h-2 w-2 rounded-full", s.dot].join(" ")} />
      {s.label}
    </span>
  );
}
