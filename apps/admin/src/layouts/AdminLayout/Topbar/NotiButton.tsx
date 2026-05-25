import { Bell } from "lucide-react";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  theme: AdminTheme;
};

export function NotiButton({ theme }: Props) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={[
        "relative flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_12px_24px_-22px_rgba(15,23,42,0.45)] transition",
        isDark
          ? "border-slate-700 text-slate-300 hover:bg-slate-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <Bell size={18} />
      <span className="absolute right-2.5 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
    </button>
  );
}
