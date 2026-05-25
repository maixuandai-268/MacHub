import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={[
        "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-(--text-primary) outline-none transition placeholder:text-(--text-tertiary) focus:border-black/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
