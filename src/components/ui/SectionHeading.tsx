import { clsx } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** Title text — rendered as the H2/H3. */
  title: ReactNode;
  /** Optional eyebrow/kicker above the title (small orange text). */
  eyebrow?: string;
  /** Optional supporting paragraph below the title. */
  subtitle?: ReactNode;
  /** Heading level for semantics/SEO. */
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  title,
  eyebrow,
  subtitle,
  as: Tag = "h2",
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange-500">
          {eyebrow}
        </p>
      )}
      <Tag className="text-2xl font-bold text-navy-800 sm:text-3xl">{title}</Tag>
      {subtitle && (
        <p className="mt-3 text-base leading-relaxed text-navy-500">{subtitle}</p>
      )}
    </div>
  );
}
