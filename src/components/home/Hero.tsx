import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

/**
 * Section 1 — Hero banner.
 * Strong headline + clear CTAs (quote / call). Above the fold.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-800 text-white">
      {/* Decorative gradient */}
      <div
        className="absolute inset-0 bg-linear-to-br from-navy-700 via-navy-800 to-navy-900"
        aria-hidden="true"
      />
      <div
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl"
        aria-hidden="true"
      />

      <Container size="wide" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-1.5 text-sm font-medium text-orange-200">
            🛡️ เปรียบเทียบแผนจากบริษัทประกันชั้นนำ
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-5xl">
            เปรียบเทียบแผนประกันภัย
            <br />
            <span className="text-orange-400">
              เลือกความคุ้มครองที่เหมาะกับคุณ
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-100">
            ให้คำปรึกษาและเปรียบเทียบแผนประกัน พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ
            และประกันบ้าน/คอนโด ก่อนตัดสินใจ เข้าใจง่าย โปร่งใส บริการทั่วประเทศ
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              href="/quote"
              variant="accent"
              size="lg"
              className="w-full sm:w-auto"
            >
              ขอใบเสนอราคาฟรี
            </Button>
            <Button
              href={siteConfig.telUrl}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              📞 โทรปรึกษา {siteConfig.phoneDisplay}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
