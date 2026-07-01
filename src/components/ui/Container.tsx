import { clsx } from "@/lib/utils";
import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** Constrain width for prose-style content. */
  size?: "default" | "prose" | "wide";
  as?: "div" | "section" | "main" | "article" | "aside" | "header" | "footer";
};

const sizeClass: Record<NonNullable<ContainerProps["size"]>, string> = {
  default: "max-w-6xl",
  prose: "max-w-3xl",
  wide: "max-w-7xl",
};

export function Container({
  children,
  className,
  size = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={clsx(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClass[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
