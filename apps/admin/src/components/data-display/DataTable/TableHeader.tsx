import type { ReactNode } from "react";

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-[#f7f7f8] text-black/48">{children}</thead>;
}
