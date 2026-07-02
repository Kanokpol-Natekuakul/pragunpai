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
  // Admin
  // -------------------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@pragunpai.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "ผู้ดูแลระบบ Pragunpai",
      passwordHash,
    },
  });
  console.log(`  ✓ Admin: ${adminEmail}`);

  // -------------------------------------------------------------------------
  // SEO meta for static pages
  // -------------------------------------------------------------------------
  const seoPages = [
    {
      pageKey: "home",
      seoTitle: "Pragunpai — เปรียบเทียบแผนประกันภัย ขอใบเสนอราคาง่าย บริการทั่วประเทศ",
      metaDescription:
        "Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ และประกันบ้าน/คอนโด ช่วยให้คุณเลือกความคุ้มครองที่เหมาะสม ขอใบเสนอราคาฟรี",
      keywords: "ประกันภัย,เปรียบเทียบประกัน,พ.ร.บ.,ประกันอุบัติเหตุ,ประกันบ้าน,Pragunpai",
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
