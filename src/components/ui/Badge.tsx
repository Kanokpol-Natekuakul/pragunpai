import { clsx } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "navy" | "orange" | "green" | "red" | "amber" | "blue";

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  navy: "bg-navy-100 text-navy-700",
  orange: "bg-orange-100 text-orange-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-700",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
