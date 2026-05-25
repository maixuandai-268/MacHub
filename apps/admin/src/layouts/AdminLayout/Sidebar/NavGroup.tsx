import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Shapes,
  Newspaper,
  Wallet,
  Inbox,
  PlusCircle,
  PackageSearch,
  List,
  UserCog,
} from "lucide-react";

export type SidebarItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export type NavGroup = {
  title: string;
  items: SidebarItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Main menu",
    items: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Order Management", to: "/admin/orders", icon: ShoppingCart },
      { label: "Customers", to: "/admin/customers", icon: Users },
      { label: "Categories", to: "/admin/categories", icon: Shapes },
      { label: "Blog", to: "/admin/blog", icon: Newspaper },
      { label: "Transaction", to: "/admin/transactions", icon: Wallet },
      { label: "Contact Inbox", to: "/admin/contact-inbox", icon: Inbox },
    ],
  },
  {
    title: "Product",
    items: [
      { label: "Add Products", to: "/admin/products/new", icon: PlusCircle },
      { label: "Product List", to: "/admin/products", icon: List },
      { label: "Inventory", to: "/admin/products/inventory", icon: PackageSearch },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Admin role", to: "/admin/admin-role", icon: UserCog },
    ],
  },
];
