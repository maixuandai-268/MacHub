import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-[#1f1f1f] border border-black",
  secondary:
    "bg-white text-black hover:bg-black hover:text-white border border-black/10",
  ghost:
    "bg-transparent text-black hover:bg-black/5 border border-transparent",
};

export function Button({
  className = "",
  variant = "primary",
  iconLeft,
  iconRight,
  children,
  ...props
}: Props) {
  return (
    <button
      className={[
        "inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
