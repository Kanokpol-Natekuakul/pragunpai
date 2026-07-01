import { clsx } from "@/lib/utils";
import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "aside" | "li";
  /** Adds hover lift + shadow for interactive cards. */
  interactive?: boolean;
};

export function Card({
  children,
  className,
  as: Tag = "div",
  interactive = false,
}: CardProps) {
  return (
    <Tag
      className={clsx(
        "rounded-xl border border-navy-100 bg-white shadow-sm",
        interactive && "transition-shadow hover:shadow-md hover:-translate-y-0.5 duration-200",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
