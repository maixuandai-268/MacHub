import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";

export type AdminTheme = "light" | "dark";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-theme") as AdminTheme | null;
    const savedCollapsed = localStorage.getItem("admin-sidebar-collapsed");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    if (savedCollapsed === "true") {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div
      className={[
        "h-screen overflow-hidden transition-colors duration-300",
        theme === "dark" ? "bg-[#0b1220]" : "bg-[#f3f5f7]",
      ].join(" ")}
    >
      <div className="h-full p-4">
        <div className="flex h-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
          <aside
            className={[
              "w-full transition-all duration-300 lg:shrink-0",
              collapsed ? "lg:w-24" : "lg:w-72",
            ].join(" ")}
          >
            <Sidebar
              collapsed={collapsed}
              onToggleCollapsed={() => setCollapsed((prev) => !prev)}
              theme={theme}
            />
          </aside>

          <main className="min-h-0 min-w-0 flex-1 lg:h-[calc(100vh-32px)]">
            <div
              className={[
                "flex h-full flex-col overflow-hidden rounded-[28px] border transition-colors duration-300",
                theme === "dark"
                  ? "border-slate-800 bg-[#111827]"
                  : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <Topbar
                theme={theme}
                onToggleTheme={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
              />

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
