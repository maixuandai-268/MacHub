type Props = {
  name: string;
  src?: string | null;
  className?: string;
};

export function Avatar({ name, src, className = "" }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return src ? (
    <img
      src={src}
      alt={name}
      className={["h-10 w-10 rounded-full object-cover", className].join(" ")}
    />
  ) : (
    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white",
        className,
      ].join(" ")}
    >
      {initials || "A"}
    </div>
  );
}
