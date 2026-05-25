import type { ReactNode } from "react";
import { X } from "lucide-react";

export function AdminModalShell({
  title,
  subtitle,
  onClose,
  widthClass = "max-w-5xl",
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  widthClass?: string;
  children: ReactNode;
}) {
  return (
    <div className="admin-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-black/35 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center">
        <div
          className={`admin-modal-panel flex max-h-[calc(100vh-32px)] w-full ${widthClass} flex-col overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_28px_100px_rgba(15,23,42,0.24)]`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-black/8 px-6 py-5">
            <div>
              <p className="text-sm font-medium text-black/45">{subtitle}</p>
              <h2 className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-black">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-black transition hover:bg-black hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
