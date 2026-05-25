import { Button } from "@/components/ui/Button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Pagination({ page, totalPages, onPageChange }: Props) {
  const safePage = clamp(page, 1, totalPages);

  const pages = (() => {
    const result: (number | "...")[] = [];
    const last = totalPages;
    const window = [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2].filter(
      (p) => p >= 1 && p <= last
    );

    result.push(1);
    if (window[0] && window[0] > 2) result.push("...");
    for (const p of window) if (p !== 1 && p !== last) result.push(p);
    if (window[window.length - 1] && window[window.length - 1] < last - 1) result.push("...");
    if (last !== 1) result.push(last);

    return result.filter((v, i, arr) => !(v === arr[i - 1]));
  })();

  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" onClick={() => onPageChange(clamp(safePage - 1, 1, totalPages))}>
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-slate-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={[
                "h-9 w-9 rounded-lg border text-sm",
                p === safePage
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button variant="outline" onClick={() => onPageChange(clamp(safePage + 1, 1, totalPages))}>
        Next
      </Button>
    </div>
  );
}
