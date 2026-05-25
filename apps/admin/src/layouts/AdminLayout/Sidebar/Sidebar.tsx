import { Link, useLocation } from "react-router-dom";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { NAV_GROUPS } from "./nav.config";
import { NavItemRow } from "./SidebarItem";
import { SidebarUserCard } from "./UserCard";
import type { AdminTheme } from "../AdminLayout";

type Props = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  theme: AdminTheme;
};

export function Sidebar({ collapsed, onToggleCollapsed, theme }: Props) {
  const { pathname } = useLocation();
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "flex h-auto flex-col rounded-3xl border p-4 transition-colors duration-300 lg:sticky lg:top-4 lg:h-[calc(100vh-32px)]",
        isDark
          ? "border-slate-800 bg-[#111827] text-slate-100"
          : "border-slate-200 bg-white text-slate-900",
      ].join(" ")}
    >
      <div className="flex items-center justify-between px-1">
        <Link
          to="/admin/dashboard"
          className={[
            "flex items-center overflow-hidden transition-all",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          <div className="text-[22px] font-extrabold tracking-[-0.08em] text-black">
            cyber
          </div>
        </Link>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl transition",
            isDark ? "hover:bg-slate-800" : "hover:bg-slate-100",
          ].join(" ")}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          {collapsed ? (
            <ChevronsRight
              size={18}
              className={isDark ? "text-slate-300" : "text-slate-500"}
            />
          ) : (
            <ChevronsLeft
              size={18}
              className={isDark ? "text-slate-300" : "text-slate-500"}
            />
          )}
        </button>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        <div className="space-y-7">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {group.title}
                </p>
              )}

              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <NavItemRow
                    key={item.to}
                    item={item}
                    active={pathname === item.to}
                    collapsed={collapsed}
                    theme={theme}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <SidebarUserCard collapsed={collapsed} theme={theme} />
      </div>
    </div>
  );
}
