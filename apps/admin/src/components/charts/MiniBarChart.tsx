type Bar = {
  label: string;
  value: number;
};

export function MiniBarChart({ data = [] }: { data?: Bar[] }) {
  return (
    <div className="flex h-24 items-end gap-2 rounded-2xl bg-[#f7f7f8] p-3">
      {data.map((bar) => (
        <div
          key={bar.label}
          className="flex-1 rounded-full bg-black/75"
          style={{ height: `${Math.max(12, Math.min(bar.value, 100))}%` }}
          title={bar.label}
        />
      ))}
    </div>
  );
}
