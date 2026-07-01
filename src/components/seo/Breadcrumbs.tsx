import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

type Crumb = { name: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "หน้าแรก", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-navy-500">
          {all.map((item, i) => {
            const last = i === all.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-1.5">
                {last ? (
                  <span className="font-medium text-navy-700" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-navy-700">
                    {item.name}
                  </Link>
                )}
                {!last && <span aria-hidden="true">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(
          all.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })),
        )}
      />
    </>
  );
}
