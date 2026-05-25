import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="border-b border-black/6 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl">
      <div className="cy-shell flex items-center gap-3 py-5 text-sm text-(--text-tertiary)">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={`${item.label}-${index}`} className="flex items-center gap-3">
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="transition hover:text-(--text-primary)"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "font-semibold text-(--text-primary)"
                      : ""
                  }
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight className="h-[15px] w-[15px] text-(--text-tertiary)" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
