import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { MoreVertical } from "lucide-react";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  changeText?: string;
};

export function StatCard({ title, value, subtitle, changeText }: Props) {
  return (
    <Card className="w-full">
      <CardHeader className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            {changeText ? <span className="text-xs font-medium text-slate-500">{changeText}</span> : null}
          </div>
          {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
        </div>

        <button className="rounded-md p-2 hover:bg-slate-100" aria-label="More">
          <MoreVertical className="h-4 w-4 text-slate-500" />
        </button>
      </CardHeader>

      <CardContent />
    </Card>
  );
}
