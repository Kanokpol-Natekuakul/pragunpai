import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

/**
 * Section 8 — Final CTA.
 */
export function CallToAction() {
  return (
    <section className="bg-orange-500 py-16">
      <Container size="wide" className="text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          พร้อมเลือกแผนประกันที่เหมาะกับคุณแล้วหรือยัง?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-orange-50">
          ขอใบเสนอราคาฟรีวันนี้
          เจ้าหน้าที่ของเราพร้อมให้คำปรึกษาและเปรียบเทียบแผนที่เหมาะสม
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            href="/quote"
            variant="primary"
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
            📞 {siteConfig.phoneDisplay}
          </Button>
        </div>
      </Container>
    </section>
  );
}
