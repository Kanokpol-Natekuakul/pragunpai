import { Hero } from "@/components/home/Hero";
import { InsuranceCategories } from "@/components/home/InsuranceCategories";
import { ServiceHighlights } from "@/components/home/ServiceHighlights";
import { QuoteSteps } from "@/components/home/QuoteSteps";
import { TrustSection } from "@/components/home/TrustSection";
import { FaqSection } from "@/components/home/FaqSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { CallToAction } from "@/components/home/CallToAction";

export default function HomePage() {
  return (
    <>
      <Hero />
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
