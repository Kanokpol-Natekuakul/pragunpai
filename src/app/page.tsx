import { Hero } from "@/components/home/Hero";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getPageBanners } from "@/lib/banners";
import { InsuranceCategories } from "@/components/home/InsuranceCategories";
import { ServiceHighlights } from "@/components/home/ServiceHighlights";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { TrustSection } from "@/components/home/TrustSection";
import { FaqSection } from "@/components/home/FaqSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CallToAction } from "@/components/home/CallToAction";

export default async function HomePage() {
  const { slides: bannerSlides } = await getPageBanners("/");

  return (
    <>
      <HeroCarousel slides={bannerSlides}>
        <Hero />
      </HeroCarousel>
      <InsuranceCategories />
      <ServiceHighlights />
      <QuoteSteps />
      <TrustSection />
      <FaqSection />
      <LatestArticles />
      <CallToAction />
    </>
  );
}
