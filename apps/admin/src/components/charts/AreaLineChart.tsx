type Point = {
  label: string;
  value: number;
};

export function AreaLineChart({ data = [] }: { data?: Point[] }) {
  if (!data.length) {
    return <div className="h-40 rounded-2xl bg-[#f7f7f8]" />;
  }

  return (
    <div className="flex h-40 items-end gap-2 rounded-2xl bg-[#f7f7f8] p-4">
      {data.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-full bg-black/80"
            style={{ height: `${Math.max(12, Math.min(point.value, 100))}%` }}
          />
          <span className="text-xs text-black/45">{point.label}</span>
        </div>
      ))}
    </div>
  );
}
