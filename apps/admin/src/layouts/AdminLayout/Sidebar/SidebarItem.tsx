import { Link } from "react-router-dom";
import type { SidebarItem } from "./nav.config";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  item: SidebarItem;
  active: boolean;
  collapsed: boolean;
  theme: AdminTheme;
};

export function NavItemRow({ item, active, collapsed, theme }: Props) {
  const Icon = item.icon;
  const isDark = theme === "dark";

  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={[
        "group flex items-center rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200",
        collapsed ? "justify-center" : "gap-3",
        active
          ? "bg-black text-white shadow-sm"
          : isDark
          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={2} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
