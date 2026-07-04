import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";
import { formatThaiDate } from "@/lib/format";

export function Footer({ logoUrl }: { logoUrl?: string }) {
  const year = formatThaiDate(new Date()).split(" ").pop();

  return (
    <footer className="mt-auto border-t border-navy-100 bg-navy-800 text-navy-100">
      <Container size="wide" className="py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand + contact */}
          <div>
            <div className="flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={siteConfig.name} className="h-9 w-auto max-w-45 object-contain brightness-0 invert" />
              ) : (
                <>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">
                    P
                  </span>
                  <span className="text-lg font-bold text-white">{siteConfig.name}</span>
                </>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy-200">
              ที่ปรึกษาและเปรียบเทียบแผนประกันภัย เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ
              บริการทั่วประเทศ
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>
                <a href={siteConfig.telUrl} className="hover:text-white">
                  โทร: {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={siteConfig.mailUrl} className="hover:text-white">
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.lineUrl}
                  className="hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LINE: {siteConfig.line}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2">
            {/* <h2 className="text-sm font-semibold uppercase tracking-wide text-white">
              ลิงก์ด่วน
            </h2> */}
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-navy-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-navy-700 pt-6 text-xs text-navy-300 sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.name}. สงวนลิขสิทธิ์ทุกประการ
          </p>
          <p>
            เปรียบเทียบแผนจากบริษัทประกันชั้นนำ — Pragunpai เป็นที่ปรึกษาประกัน
            ไม่ใช่บริษัทประกันโดยตรง
          </p>
        </div>
      </Container>
    </footer>
  );
}
