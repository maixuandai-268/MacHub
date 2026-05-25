import { ChevronDown } from "lucide-react";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  theme?: AdminTheme;
  name?: string;
};

export function UserMenu({
  theme = "light",
  name = "Cyber Admin",
}: Props) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label="User menu"
      className={[
        "flex items-center gap-2 rounded-full border p-1 pr-3 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)] transition",
        isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-sm font-semibold text-white ring-4 ring-slate-100">
        C
      </div>

      <div className="hidden text-left sm:block">
        <p className={["text-sm font-semibold", isDark ? "text-white" : "text-slate-900"].join(" ")}>{name}</p>
        <p className="text-xs text-slate-400">admin@cyber.com</p>
      </div>

      <ChevronDown
        size={16}
        className={isDark ? "text-slate-400" : "text-slate-500"}
      />
    </button>
  );
}
