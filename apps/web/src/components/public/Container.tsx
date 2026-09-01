import type { ReactNode } from "react";

export function Container({
  children,
  className,
  variant = "content",
}: {
  children: ReactNode;
  className?: string;
  variant?: "content" | "header";
}) {
  const base = variant === "header" ? "container container--header" : "container";
  return <div className={className ? `${base} ${className}` : base}>{children}</div>;
}
