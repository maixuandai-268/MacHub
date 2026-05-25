import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusPill } from "@/components/data-display/StatusPill";
import type { CustomerRow } from "@/features/customers/types";
import { MessageSquare, Trash2 } from "lucide-react";
import { formatCurrencyVnd } from '@shared/formatters/currency';

type Props = {
  rows: CustomerRow[];
};

function formatMoney(n: number) {
  return formatCurrencyVnd(n);
}

export function CustomersTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="rounded-lg bg-[#f7f7f8] px-4 py-3">
          <div className="grid grid-cols-7 gap-3 text-xs font-semibold text-slate-700">
            <div>Customer Id</div>
            <div>Name</div>
            <div>Phone</div>
            <div className="text-center">Order Count</div>
            <div className="text-center">Total Spend</div>
            <div className="text-center">Status</div>
            <div className="text-center">Action</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-7 items-center gap-3 px-4 py-4 text-sm">
              <div className="font-medium text-slate-900">{r.id}</div>
              <div className="text-slate-900">{r.name}</div>
              <div className="text-slate-600">{r.phone}</div>
              <div className="text-center text-slate-900">{r.orderCount}</div>
              <div className="text-center text-slate-900">{formatMoney(r.totalSpend)}</div>
              <div className="flex justify-center">
                <StatusPill status={r.status} />
              </div>
              <div className="flex justify-center gap-3">
                <button className="rounded-md p-2 hover:bg-slate-100" aria-label="Message">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                </button>
                <button className="rounded-md p-2 hover:bg-slate-100" aria-label="Delete">
                  <Trash2 className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
