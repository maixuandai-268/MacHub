import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={[
        "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none",
        "placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
