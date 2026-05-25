import { useLocation } from "react-router-dom";
import { PATHS } from "@/app/router/paths";
import { GlobalSearch } from "./GlobalSearch";
import { NotiButton } from "./NotiButton";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import type { AdminTheme } from "../AdminLayout";

const TITLE_BY_PATH: Record<string, string> = {
  [PATHS.dashboard]: "Dashboard",
  [PATHS.orders]: "Order Management",
  [PATHS.customers]: "Customers",
  [PATHS.categories]: "Categories",
  [PATHS.addCategory]: "Add Category",
  [PATHS.blog]: "Blog",
  [PATHS.addBlog]: "Add Blog",
  [PATHS.transactions]: "Transaction",
  [PATHS.contactInbox]: "Contact Inbox",
  [PATHS.addProduct]: "Add Products",
  [PATHS.adminRole]: "Admin role",

  [PATHS.dev.dashboard]: "Dashboard",
  [PATHS.dev.orders]: "Order Management",
  [PATHS.dev.customers]: "Customers",
  [PATHS.dev.categories]: "Categories",
  [PATHS.dev.addCategory]: "Add Category",
  [PATHS.dev.blog]: "Blog",
  [PATHS.dev.addBlog]: "Add Blog",
  [PATHS.dev.transactions]: "Transaction",
  [PATHS.dev.addProduct]: "Add Products",
  [PATHS.dev.adminRole]: "Admin role",
};

const DESCRIPTION_BY_PATH: Record<string, string> = {
  [PATHS.dashboard]: "Monitor sales, orders, categories, and recent storefront activity.",
  [PATHS.orders]: "Review fulfilment state, payment progress, and customer delivery flow.",
  [PATHS.customers]: "Track customer profiles, registration state, and recent account activity.",
  [PATHS.categories]: "Maintain catalog grouping, category imagery, and shared storefront structure.",
  [PATHS.addCategory]: "Create a new category, upload cover imagery, and publish it to the catalog taxonomy.",
  [PATHS.blog]: "Publish journal posts, update covers, and keep editorial content in sync.",
  [PATHS.addBlog]: "Create a new editorial article with cover imagery, sections, and storefront publication settings.",
  [PATHS.transactions]: "Inspect payment health, transaction totals, and order-level settlement status.",
  [PATHS.contactInbox]: "Review support inquiries, update status, and follow up on customer issues.",
  [PATHS.addProduct]: "Create products, upload media, and assign category, stock, and pricing data.",
  [PATHS.adminRole]: "Manage internal roles and keep backoffice access aligned with project scope.",

  [PATHS.dev.dashboard]: "Monitor sales, orders, categories, and recent storefront activity.",
  [PATHS.dev.orders]: "Review fulfilment state, payment progress, and customer delivery flow.",
  [PATHS.dev.customers]: "Track customer profiles, registration state, and recent account activity.",
  [PATHS.dev.categories]: "Maintain catalog grouping, category imagery, and shared storefront structure.",
  [PATHS.dev.addCategory]: "Create a new category, upload cover imagery, and publish it to the catalog taxonomy.",
  [PATHS.dev.blog]: "Publish journal posts, update covers, and keep editorial content in sync.",
  [PATHS.dev.addBlog]: "Create a new editorial article with cover imagery, sections, and storefront publication settings.",
  [PATHS.dev.transactions]: "Inspect payment health, transaction totals, and order-level settlement status.",
  [PATHS.dev.addProduct]: "Create products, upload media, and assign category, stock, and pricing data.",
  [PATHS.dev.adminRole]: "Manage internal roles and keep backoffice access aligned with project scope.",
};

type Props = {
  theme: AdminTheme;
  onToggleTheme: () => void;
};

export function Topbar({ theme, onToggleTheme }: Props) {
  const location = useLocation();
  const title = TITLE_BY_PATH[location.pathname] ?? "Dashboard";
  const description =
    DESCRIPTION_BY_PATH[location.pathname] ??
    "Manage storefront operations, catalog data, and daily backoffice workflows.";
  const isDark = theme === "dark";

  return (
    <div
      className={[
        "flex flex-col gap-4 border-b px-5 py-5 transition-colors duration-300 xl:flex-row xl:items-center xl:justify-between",
        isDark ? "border-slate-800" : "border-slate-100 bg-white/90 backdrop-blur",
      ].join(" ")}
    >
      <div>
        <p className={["text-xs uppercase tracking-[0.18em]", isDark ? "text-slate-500" : "text-slate-400"].join(" ")}>
          Cyber admin
        </p>
        <h1
          className={[
            "mt-2 text-[1.8rem] font-semibold tracking-[-0.05em]",
            isDark ? "text-white" : "text-slate-900",
          ].join(" ")}
        >
          {title}
        </h1>
        <p className={["mt-2 max-w-[42rem] text-sm leading-6", isDark ? "text-slate-400" : "text-slate-500"].join(" ")}>
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:min-w-[620px] xl:justify-end">
        <div className="w-full sm:flex-1 xl:max-w-[560px]">
          <GlobalSearch theme={theme} />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <NotiButton theme={theme} />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <UserMenu theme={theme} />
        </div>
      </div>
    </div>
  );
}
