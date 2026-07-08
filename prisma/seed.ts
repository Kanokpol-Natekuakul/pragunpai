/**
 * Seed script for Pragunpai.com
 *
 * Creates:
 * - The single admin account (from env or sensible dev default)
 * - Default SEO meta for static pages
 * - Default site settings (contact, hero, floating buttons, NAP)
 * - A few FAQ items (FAQPage JSON-LD)
 *
 * Run with: npx prisma db seed
 * (configured in package.json -> "prisma": { "seed": "..." })
 *
 * NOTE: This script connects directly via Prisma (not the app singleton).
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Pragunpai database...");

  // -------------------------------------------------------------------------
  // Admin accounts (client + support)
  // -------------------------------------------------------------------------
  const admins = [
    {
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@pragunpai.com",
      password: process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
      name: "ผู้ดูแลระบบ Pragunpai",
    },
    {
      email: process.env.SEED_SUPPORT_EMAIL ?? "support@pragunpai.com",
      password: process.env.SEED_SUPPORT_PASSWORD ?? "ChangeMe123!",
      name: "ฝ่ายสนับสนุน Pragunpai",
    },
  ];

  for (const admin of admins) {
    const hash = await bcrypt.hash(admin.password, 12);
    await prisma.admin.upsert({
      where: { email: admin.email },
      update: {},
      create: {
        email: admin.email,
        name: admin.name,
        passwordHash: hash,
      },
    });
    console.log(`  ✓ Admin: ${admin.email}`);
  }

  // -------------------------------------------------------------------------
  // SEO meta for static pages
  // -------------------------------------------------------------------------
  const seoPages = [
    {
      pageKey: "home",
      seoTitle:
        "Pragunpai — เปรียบเทียบแผนประกันภัย ขอใบเสนอราคาง่าย บริการทั่วประเทศ",
      metaDescription:
        "Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ และประกันบ้าน/คอนโด ช่วยให้คุณเลือกความคุ้มครองที่เหมาะสม ขอใบเสนอราคาฟรี",
      keywords:
        "ประกันภัย,เปรียบเทียบประกัน,พ.ร.บ.,ประกันอุบัติเหตุ,ประกันบ้าน,Pragunpai",
    },
    {
      pageKey: "about",
      seoTitle: "เกี่ยวกับเรา — Pragunpai ที่ปรึกษาประกันภัยที่โปร่งใส",
      metaDescription:
        "Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกัน เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ โดยเน้นความเข้าใจง่าย ความโปร่งใส และการให้ข้อมูลที่เป็นประโยชน์",
      keywords: "เกี่ยวกับ Pragunpai,ที่ปรึกษาประกัน,โบรกเกอร์ประกัน",
    },
    {
      pageKey: "contact",
      seoTitle: "ติดต่อเรา — Pragunpai ประกันภัย โทร LINE Email",
      metaDescription:
        "ติดต่อ Pragunpai เพื่อขอคำปรึกษาและใบเสนอราคาประกันภัย โทร 081 941 6620 แอด LINE หรืออีเมล service@pragunpai.com บริการทั่วประเทศ",
      keywords: "ติดต่อ Pragunpai,เบอร์โทรประกัน,LINE ประกัน",
    },
    {
      pageKey: "privacy",
      seoTitle: "นโยบายความเป็นส่วนตัว (PDPA) — Pragunpai",
      metaDescription:
        "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) ของ Pragunpai",
      keywords: "PDPA,นโยบายความเป็นส่วนตัว,คุ้มครองข้อมูล",
    },
  ];

  for (const p of seoPages) {
    await prisma.seoMeta.upsert({
      where: { pageKey: p.pageKey },
      update: {},
      create: p,
    });
  }
  console.log(`  ✓ ${seoPages.length} SEO meta pages`);

  // -------------------------------------------------------------------------
  // Site settings (NAP consistency — critical for Local SEO)
  // -------------------------------------------------------------------------
  const settings = [
    {
      key: "contact",
      value: {
        phone: "0819416620",
        phoneDisplay: "081 941 6620",
        line: "0819416620",
        email: "service@pragunpai.com",
        lineUrl: "https://line.me/R/ti/p/~0819416620",
      },
    },
    {
      key: "nap",
      value: {
        name: "Pragunpai",
        phone: "0819416620",
        email: "service@pragunpai.com",
        addressRegion: "ทั่วประเทศ",
        addressCountry: "TH",
      },
    },
    {
      key: "hero",
      value: {
        headline: "เปรียบเทียบแผนประกันภัย เลือกความคุ้มครองที่เหมาะกับคุณ",
        subheadline:
          "ให้คำปรึกษาและเปรียบเทียบแผนประกัน พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ และประกันบ้าน/คอนโด ก่อนตัดสินใจ",
        ctaPrimary: { label: "ขอใบเสนอราคาฟรี", href: "/quote" },
        ctaSecondary: { label: "โทรปรึกษา", href: "tel:0819416620" },
      },
    },
    {
      key: "floatingButtons",
      value: { phone: true, line: true, quote: true },
    },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`  ✓ ${settings.length} site settings`);

  // -------------------------------------------------------------------------
  // Insurance Pages (Products)
  // -------------------------------------------------------------------------
  const insurancePages = [
    {
      id: "prod-car-act",
      slug: "car-act",
      name: "พ.ร.บ. รถยนต์",
      type: "CAR_ACT" as const,
      summary: "ประกันภัยภาคบังคับตามกฎหมาย คุ้มครองผู้ประสบภัยจากรถยนต์",
      coverage:
        "คุ้มครองค่ารักษาพยาบาลสูงสุด 80,000 บาท และทุนประกันกรณีเสียชีวิตสูงสุด 500,000 บาท",
      premium: "เริ่มต้น 645 บาท/ปี",
      conditions:
        "คุ้มครองผู้ประสบภัยจากรถทุกคน ไม่ว่าจะเป็นผู้ขับขี่ ผู้โดยสาร หรือคนเดินเท้า",
      pdfUrl: "/pdfs/brochure-car-act.pdf",
      seoTitle: "พ.ร.บ. ประกันภัยรถยนต์ — ขอใบเสนอราคา ต่อ พ.ร.บ. ง่าย",
      metaDescription:
        "พ.ร.บ. ประกันภัยรถยนต์ เป็นประกันภัยภาคบังคับตามกฎหมาย ครอบคลุมค่ารักษาพยาบาลและทุนประกันในกรณีเสียชีวิต ขอใบเสนอราคาและต่อ พ.ร.บ. ได้ที่ Pragunpai",
      keywords: "พ.ร.บ. รถยนต์, พรบออนไลน์, ต่อพรบ",
      published: true,
    },
    {
      id: "prod-accident",
      slug: "accident-insurance",
      name: "ประกันอุบัติเหตุ",
      type: "ACCIDENT" as const,
      summary:
        "ความคุ้มครองสำหรับเด็กแรกเกิดถึงผู้สูงอายุ เปรียบเทียบแผนและเลือกความคุ้มครองที่เหมาะสม",
      coverage:
        "คุ้มครองค่ารักษาพยาบาลจากอุบัติเหตุ เงินชดเชยรายได้ และทุนประกันกรณีเสียชีวิตจากอุบัติเหตุ",
      premium: "เริ่มต้น 1,000 บาท/ปี",
      conditions:
        "ผู้เอาประกันภัยต้องมีอายุระหว่าง 1-80 ปี (ขึ้นอยู่กับแผนประกัน)",
      pdfUrl: "/pdfs/brochure-accident.pdf",
      seoTitle: "ประกันอุบัติเหตุ — เปรียบเทียบแผน ครอบคลุมเด็กถึงผู้สูงอายุ",
      metaDescription:
        "ครอบคลุมเด็กแรกเกิดถึงผู้สูงอายุ เปรียบเทียบแผนและขอใบเสนอราคาได้ที่ Pragunpai",
      keywords:
        "ประกันอุบัติเหตุ, ประกันอุบัติเหตุส่วนบุคคล, ประกันอุบัติเหตุผู้สูงอายุ",
      published: true,
    },
    {
      id: "prod-property",
      slug: "property-insurance",
      name: "ประกันบ้านและทรัพย์สิน",
      type: "PROPERTY" as const,
      summary:
        "คุ้มครองบ้านและสิ่งของในบ้านจากอัคคีภัย ภัยน้ำท่วม พายุ และการสูญหาย",
      coverage:
        "คุ้มครองตัวอาคารและสิ่งปลูกสร้าง ทรัพย์สินภายใน และความรับผิดต่อบุคคลภายนอก",
      premium: "เริ่มต้น 1,500 บาท/ปี",
      conditions:
        "สิ่งปลูกสร้างต้องเป็นคอนกรีตล้วนหรือครึ่งตึกครึ่งไม้ตามข้อกำหนด",
      pdfUrl: "/pdfs/brochure-property.pdf",
      seoTitle: "ประกันบ้าน คอนโด หอพัก — คุ้มครองทรัพย์สิน ขอใบเสนอราคา",
      metaDescription:
        "ประกันบ้าน ประกันคอนโด และประกันหอพัก คุ้มครองทรัพย์สินจากอัคคีภัย ภัยน้ำท่วม และการสูญหาย เปรียบเทียบแผนและขอใบเสนอราคาได้ที่ Pragunpai",
      keywords: "ประกันบ้าน, ประกันคอนโด, ประกันอัคคีภัย",
      published: true,
    },
  ];

  for (const page of insurancePages) {
    await prisma.insurancePage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }
  console.log(`  ✓ ${insurancePages.length} insurance pages`);

  // -------------------------------------------------------------------------
  // FAQ items (FAQPage JSON-LD — AEO + GEO)
  // -------------------------------------------------------------------------
  const faqs = [
    {
      question: "Pragunpai เป็นบริษัทประกันภัยหรือไม่?",
      answer:
        "Pragunpai เป็นที่ปรึกษาและผู้เปรียบเทียบแผนประกันภัย ไม่ใช่บริษัทประกันโดยตรง เราเปรียบเทียบแผนจากบริษัทประกันชั้นนำ เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ",
      category: "general",
      order: 1,
    },
    {
      question: "การขอใบเสนอราคาผ่านเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
      answer:
        "การขอใบเสนอราคาผ่านเว็บไซต์ Pragunpai ไม่มีค่าใช้จ่าย เพียงกรอกฟอร์มและเจ้าหน้าที่จะติดต่อกลับเพื่อเสนอแผนที่เหมาะสม",
      category: "general",
      order: 2,
    },
    {
      question: "Pragunpai ให้บริการในจังหวัดใดบ้าง?",
      answer:
        "Pragunpai ให้บริการทั่วประเทศไทย คุณสามารถขอใบเสนอราคาและรับคำปรึกษาได้ไม่ว่าจะอยู่จังหวัดใด",
      category: "general",
      order: 3,
    },
    {
      question: "ข้อมูลที่กรอกในฟอร์มปลอดภัยหรือไม่?",
      answer:
        "ข้อมูลของคุณได้รับการคุ้มครองตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) เราเก็บข้อมูล Lead ไว้เป็นเวลา 1 เดือน และใช้ข้อมูลเพื่อติดต่อกลับเพื่อเสนอราคาและให้คำปรึกษาด้านประกันภัยเท่านั้น",
      category: "general",
      order: 4,
    },
  ];

  for (const f of faqs) {
    await prisma.faqItem.upsert({
      where: { id: `faq-${f.order}` },
      update: {},
      create: { id: `faq-${f.order}`, ...f },
    });
  }
  console.log(`  ✓ ${faqs.length} FAQ items`);

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
