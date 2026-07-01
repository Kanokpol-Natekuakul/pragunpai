import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <Container size="wide" className="py-20 text-center">
      <h1 className="text-4xl font-bold text-navy-800">{siteConfig.name}</h1>
      <p className="mt-4 text-lg text-navy-500">
        เปรียบเทียบแผนประกันภัย ขอใบเสนอราคาง่าย
      </p>
      <p className="mt-2 text-sm text-navy-400">
        (หน้าแรกฉบับเต็มจะถูกสร้างใน Phase D)
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button href="/quote" variant="accent" size="lg">
          ขอใบเสนอราคา
        </Button>
        <Button href={siteConfig.telUrl} variant="primary" size="lg">
          โทร {siteConfig.phoneDisplay}
        </Button>
      </div>
    </Container>
  );
}
