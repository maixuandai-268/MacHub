import { Search } from "lucide-react";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  theme: AdminTheme;
};

export function GlobalSearch({ theme }: Props) {
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "flex h-14 items-center rounded-full border px-5 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)] transition-colors duration-300",
        isDark
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-[#f8f8f8]",
      ].join(" ")}
    >
      <Search size={18} className={isDark ? "text-slate-500" : "text-slate-400"} />
      <input
        placeholder="Search data, users, or reports"
        className={[
          "ml-3 w-full bg-transparent text-sm outline-none",
          isDark
            ? "text-slate-100 placeholder:text-slate-500"
            : "text-slate-700 placeholder:text-slate-400",
        ].join(" ")}
      />
    </div>
  );
}
