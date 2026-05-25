import { Moon, Sun } from "lucide-react";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  theme: AdminTheme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "relative flex h-12 w-15.5 items-center rounded-full px-1 transition-colors",
        isDark ? "bg-slate-800" : "bg-slate-200",
      ].join(" ")}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div
        className={[
          "absolute flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition-all",
          isDark ? "translate-x-4.5" : "translate-x-0",
        ].join(" ")}
      >
        {isDark ? (
          <Moon size={18} className="text-slate-700" />
        ) : (
          <Sun size={18} className="text-slate-700" />
        )}
      </div>
    </button>
  );
}
