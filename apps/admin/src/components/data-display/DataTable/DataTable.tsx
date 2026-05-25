import type { ReactNode } from "react";

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-[24px] border border-black/8">{children}</div>;
}
