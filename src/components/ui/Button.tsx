import Link from "next/link";
import { clsx } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-navy-600 text-white hover:bg-navy-700 shadow-sm",
  secondary: "bg-white text-navy-700 border border-navy-200 hover:bg-navy-50",
  accent: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
  outline:
    "bg-transparent text-navy-700 border border-navy-300 hover:bg-navy-50",
  ghost: "bg-transparent text-navy-700 hover:bg-navy-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-6 py-3",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "className" | "children"
  >;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
  } = props;
  const classes = clsx(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    const { href, ...anchorRest } = rest as ButtonAsLink;
    // External or tel:/mailto: links render as plain anchors.
    const isExternal = /^(https?:|tel:|mailto:|line:)/.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          className={classes}
          {...(anchorRest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
