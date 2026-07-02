/**
 * Schema.org JSON-LD validator script.
 * Runs in development/test environments to prevent rich-results and GEO metadata regressions.
 */
import {
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  articleJsonLd,
  productJsonLd,
  howToJsonLd,
} from "../src/lib/jsonld";

// Setup mock env variables for tests
process.env.NEXT_PUBLIC_SITE_URL = "https://pragunpai.com";
process.env.NEXT_PUBLIC_SITE_NAME = "Pragunpai Test";
process.env.NEXT_PUBLIC_PHONE = "0819416620";
process.env.NEXT_PUBLIC_LINE = "0819416620";
process.env.NEXT_PUBLIC_EMAIL = "service@pragunpai.com";

let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  } else {
    console.log(`✓ PASS: ${message}`);
  }
}

async function runTests() {
  console.log("🔍 Starting Schema.org JSON-LD Structure Audit...\n");

  // 1. Test Organization Schema
  const org = organizationJsonLd();
  assert(org["@context"] === "https://schema.org", "Organization context must be schema.org");
  assert(org["@type"] === "InsuranceAgency", "Organization type must be InsuranceAgency");
  assert(typeof org.name === "string" && org.name.length > 0, "Organization name must be a valid string");
  assert(typeof org.url === "string" && (org.url.includes("http://") || org.url.includes("https://")), "Organization URL must be absolute");

  // 2. Test WebSite Schema
  const ws = websiteJsonLd();
  assert(ws["@context"] === "https://schema.org", "WebSite context must be schema.org");
  assert(ws["@type"] === "WebSite", "WebSite type must be WebSite");
  assert(ws.inLanguage === "th-TH", "WebSite language must be th-TH");

  // 3. Test LocalBusiness Schema
  const lb = localBusinessJsonLd();
  assert(lb["@type"] === "InsuranceAgency", "LocalBusiness type must be InsuranceAgency");
  assert(lb.priceRange === "$$", "LocalBusiness priceRange must be $$");
  assert(typeof lb.address === "object" && lb.address !== null, "LocalBusiness address must be an object");

  // 4. Test Breadcrumbs Schema
  const crumbs = breadcrumbJsonLd([
    { name: "หน้าแรก", url: "https://pragunpai.com" },
    { name: "พ.ร.บ. รถยนต์", url: "https://pragunpai.com/car-act" },
  ]);
  assert(crumbs["@type"] === "BreadcrumbList", "Breadcrumbs type must be BreadcrumbList");
  assert(Array.isArray(crumbs.itemListElement) && crumbs.itemListElement.length === 2, "Breadcrumbs list should contain 2 items");
  assert(crumbs.itemListElement[0].position === 1, "First breadcrumb position should be 1");

  // 5. Test FAQ Page Schema
  const faq = faqPageJsonLd([
    { question: "Q1?", answer: "A1" },
    { question: "Q2?", answer: "A2" },
  ]);
  assert(faq["@type"] === "FAQPage", "FAQ Page type must be FAQPage");
  assert(Array.isArray(faq.mainEntity) && faq.mainEntity.length === 2, "FAQ mainEntity should contain 2 items");
  assert(faq.mainEntity[0].acceptedAnswer.text === "A1", "First FAQ answer must match");

  // 6. Test Article Schema
  const art = articleJsonLd({
    title: "บทความทดสอบ",
    description: "เนื้อหาย่อบทความ",
    slug: "test-article",
    datePublished: new Date(),
  });
  assert(art["@type"] === "Article", "Article type must be Article");
  assert(art.headline === "บทความทดสอบ", "Article headline must match title");
  assert(art.mainEntityOfPage !== undefined, "Article mainEntityOfPage must be set");

  // 7. Test Product Schema
  const prod = productJsonLd({
    name: "พ.ร.บ. รถยนต์",
    description: "ประกันภัยภาคบังคับ",
    slug: "car-act",
    premium: "เริ่มต้น 645 บาท",
  });
  assert(prod["@type"] === "Product", "Product type must be Product");
  assert(prod.category === "ประกันภัย", "Product category must be ประกันภัย");
  assert(prod.offers !== undefined, "Product offers must be set when premium is provided");

  // 8. Test HowTo Schema
  const howto = howToJsonLd({
    name: "ขั้นตอนการทำประกัน",
    steps: ["กรอกฟอร์ม", "แนบเอกสาร", "ชำระเงิน"],
  });
  assert(howto["@type"] === "HowTo", "HowTo type must be HowTo");
  assert(Array.isArray(howto.step) && howto.step.length === 3, "HowTo should have 3 steps");
  assert(howto.step[1].position === 2, "Second step position should be 2");

  console.log("\n==========================================");
  if (testsFailed > 0) {
    console.error(`❌ Audit Completed with ${testsFailed} failure(s).`);
    process.exit(1);
  } else {
    console.log("✓ Audit Completed: All Schema.org JSON-LD structures are 100% correct!");
    process.exit(0);
  }
}

runTests();
