import { useMemo, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CustomerOverviewMetric, CustomerOverviewPoint } from "../types";

type Props = {
  title?: string;
  metrics: CustomerOverviewMetric[];
  points: CustomerOverviewPoint[];
};

export function CustomerOverviewCard({
  title = "Customer Overview",
  metrics,
  points,
}: Props) {
  const [range, setRange] = useState<"this_week" | "last_week">("this_week");

  const chartPoints = useMemo(() => {
    if (range === "this_week") return points;
    return points.map((p) => ({ ...p, value: Math.max(0, Math.round(p.value * 0.9)) }));
  }, [range, points]);

  const max = Math.max(...chartPoints.map((p) => p.value), 1);

  return (
    <Card className="w-full">
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1">
          <Button
            size="sm"
            variant={range === "this_week" ? "solid" : "ghost"}
            className={range === "this_week" ? "bg-black text-white hover:bg-black" : ""}
            onClick={() => setRange("this_week")}
          >
            This week
          </Button>
          <Button
            size="sm"
            variant={range === "last_week" ? "solid" : "ghost"}
            className={range === "last_week" ? "bg-black text-white hover:bg-black" : ""}
            onClick={() => setRange("last_week")}
          >
            Last week
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="border-b border-slate-100 pb-2">
              <p className="text-lg font-semibold text-slate-900">{m.value}</p>
              <p className="text-xs text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gradient-to-b from-slate-50 to-white p-3">
          <SimpleAreaChart points={chartPoints} max={max} />
          <div className="mt-3 flex justify-between text-xs text-slate-500">
            {chartPoints.map((p) => (
              <span key={p.day} className="w-full text-center">
                {p.day}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SimpleAreaChart({ points, max }: { points: CustomerOverviewPoint[]; max: number }) {
  const w = 900;
  const h = 220;
  const pad = 16;

  const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = points.map((p) => {
    const t = p.value / max;
    return pad + (1 - t) * (h - pad * 2);
  });

  const pathLine = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
    .join(" ");

  const pathArea = `${pathLine} L ${xs[xs.length - 1]} ${h - pad} L ${xs[0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      <path d={pathArea} fill="rgba(15,23,42,0.08)" />
      <path d={pathLine} fill="none" stroke="rgba(15,23,42,0.85)" strokeWidth="3" />
      {points.map((p, i) =>
        p.day === "Wed" ? (
          <g key={p.day}>
            <circle cx={xs[i]} cy={ys[i]} r="6" fill="white" stroke="rgba(15,23,42,0.85)" strokeWidth="3" />
            <line x1={xs[i]} y1={ys[i]} x2={xs[i]} y2={h - 16} stroke="rgba(15,23,42,0.18)" strokeDasharray="4 6" />
          </g>
        ) : null
      )}
    </svg>
  );
}
