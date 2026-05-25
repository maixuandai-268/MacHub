import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: Props) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: Props) {
  return <div className={["p-4", className].join(" ")} {...props} />;
}

export function CardContent({ className = "", ...props }: Props) {
  return <div className={["p-4 pt-0", className].join(" ")} {...props} />;
}
