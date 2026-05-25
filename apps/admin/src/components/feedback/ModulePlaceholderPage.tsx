import { Link } from "react-router-dom";
import { ArrowLeft, Layers3 } from "lucide-react";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  backTo?: string;
  backLabel?: string;
};

export default function ModulePlaceholderPage({
  eyebrow = "Module",
  title,
  description,
  backTo = "/admin/dashboard",
  backLabel = "Back to dashboard",
}: Props) {
  return (
    <div className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.04)]">
      <div className="mx-auto flex max-w-3xl flex-col items-center py-12 text-center">
        <div className="flex h-18 w-18 items-center justify-center rounded-full bg-[#f7f7f8] text-black">
          <Layers3 className="h-8 w-8" />
        </div>
        <p className="mt-8 text-sm font-medium uppercase tracking-[0.22em] text-black/35">{eyebrow}</p>
        <h1 className="mt-4 text-[2.4rem] font-semibold tracking-[-0.05em] text-black">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">{description}</p>
        <Link
          to={backTo}
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black px-6 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
