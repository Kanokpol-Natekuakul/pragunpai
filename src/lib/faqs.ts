import { prisma } from "@/lib/prisma";

export type FaqCategory = "general" | "car-act" | "accident" | "property";

export type FaqItemView = {
  id?: string;
  question: string;
  answer: string;
  order: number;
};

export type FaqSectionView = {
  category: FaqCategory;
  label: string;
  path: string;
  eyebrow: string;
  title: string;
  items: FaqItemView[];
};

export const DEFAULT_FAQS: Record<FaqCategory, Array<{ question: string; answer: string }>> = {
  general: [
    {
      question: "Pragunpai เป็นบริษัทประกันภัยหรือไม่?",
      answer: "Pragunpai เป็นที่ปรึกษาและผู้เปรียบเทียบแผนประกันภัย ไม่ใช่บริษัทประกันโดยตรง เราเปรียบเทียบแผนจากบริษัทประกันชั้นนำ เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ",
    },
    {
      question: "การขอใบเสนอราคาผ่านเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
      answer: "การขอใบเสนอราคาผ่านเว็บไซต์ Pragunpai ไม่มีค่าใช้จ่าย เพียงกรอกฟอร์มและเจ้าหน้าที่จะติดต่อกลับเพื่อเสนอแผนที่เหมาะสม",
    },
  ],
  "car-act": [
    {
      question: "พ.ร.บ. ประกันภัยรถยนต์ คืออะไร?",
      answer: "พ.ร.บ. ประกันภัยรถยนต์ คือ ประกันภัยภาคบังคับตามพระราชบัญญัติคุ้มครองผู้ประสบภัยจากรถ พ.ศ. 2535 ทุกคนที่มีรถยนต์ต้องซื้อตามกฎหมาย คุ้มครองผู้ประสบภัยจากรถยนต์ โดยครอบคลุมค่ารักษาพยาบาลและทุนประกันในกรณีเสียชีวิต สูญเสียอวัยวะ หรือทุพพลภาพถาวร",
    },
    {
      question: "ไม่ต่อ พ.ร.บ. มีความผิดหรือไม่?",
      answer: "ใช่ การขับรถที่ไม่มี พ.ร.บ. มีความผิดตามกฎหมาย มีโทษปรับไม่เกิน 10,000 บาท และหากเกิดอุบัติเหตุจะต้องรับผิดชอบค่าเสียหายด้วยตนเอง",
    },
    {
      question: "สามารถต่อ พ.ร.บ. ล่วงหน้ากี่วัน?",
      answer: "สามารถต่อ พ.ร.บ. ล่วงหน้าได้สูงสุด 60 วัน ก่อนวันหมดอายุ แนะนำให้ต่อก่อนหมดอายุเพื่อความต่อเนื่องของความคุ้มครอง",
    },
  ],
  accident: [
    {
      question: "ประกันอุบัติเหตุครอบคลุมผู้สูงอายุหรือไม่?",
      answer: "ได้ ประกันอุบัติเหตุหลายแผนรองรับผู้สูงอายุจนถึง 75 หรือ 80 ปี ขึ้นอยู่กับแผน โดยครอบคลุมค่ารักษาพยาบาลจากอุบัติเหตุและทุนประกัน ซึ่งเหมาะสำหรับผู้สูงอายุที่ต้องการความคุ้มครองเพิ่มเติม",
    },
    {
      question: "ประกันอุบัติเหตุกับประกันสุขภาพต่างกันอย่างไร?",
      answer: "ประกันอุบัติเหตุคุ้มครองค่ารักษาพยาบาลและทุนประกันที่เกิดจากอุบัติเหตุเท่านั้น ในขณะที่ประกันสุขภาพคุ้มครองทั้งจากอุบัติเหตุและการเจ็บป่วย ประกันอุบัติเหตุจึงเหมาะเป็นสิ่งเสริมและมีเบี้ยประกันที่ถูกกว่า",
    },
    {
      question: "ซื้อประกันอุบัติเหตุให้ลูกได้ตั้งแต่อายุเท่าไหร่?",
      answer: "สามารถซื้อประกันอุบัติเหตุให้เด็กได้ตั้งแต่แรกเกิดหรืออายุ 15 วันขึ้นไป ขึ้นอยู่กับเงื่อนไขของแต่ละแผน ซึ่งจะคุ้มครองค่ารักษาพยาบาลและทุนประกันในกรณีเกิดอุบัติเหตุกับเด็ก",
    },
  ],
  property: [
    {
      question: "ประกันบ้านคุ้มครองอะไรบ้าง?",
      answer: "ประกันบ้านคุ้มครองตัวบ้าน สิ่งของในบ้าน และความรับผิดต่อบุคคลที่ 3 จากอัคคีภัย ฟ้าผ่า พายุ น้ำท่วม และการสูญหาย ขึ้นอยู่กับขอบเขตของแต่ละแผน",
    },
    {
      question: "ประกันคอนโดกับประกันบ้านต่างกันอย่างไร?",
      answer: "ประกันคอนโดมักคุ้มครองเฉพาะส่วนที่เป็นการตกแต่งภายในห้องและทรัพย์สินส่วนบุคคล เนื่องจากตัวอาคารมักได้รับการคุ้มครองจากนิติบุคคล ในขณะที่ประกันบ้านคุ้มครองทั้งตัวบ้านและที่ดิน",
    },
    {
      question: "มีผู้เช่าต้องทำประกันบ้านหรือไม่?",
      answer: "หากคุณเป็นเจ้าของบ้านและมีผู้เช่า ขอแนะนำให้ทำประกันบ้านเพื่อคุ้มครองตัวอาคารและความรับผิดต่อผู้เช่าและบุคคลที่ 3 ผู้เช่าก็สามารถทำประกันทรัพย์สินเพื่อคุ้มครองของส่วนตัวได้",
    },
  ],
};

export const FAQ_CATEGORIES: Array<{
  category: FaqCategory;
  label: string;
  path: string;
  defaultTitle: string;
}> = [
  {
    category: "general",
    label: "หน้าแรก",
    path: "/",
    defaultTitle: "คำถามที่ลูกค้าสอบถามบ่อย",
  },
  {
    category: "car-act",
    label: "พ.ร.บ.",
    path: "/car-act",
    defaultTitle: "คำถามเกี่ยวกับ พ.ร.บ.",
  },
  {
    category: "accident",
    label: "ประกันอุบัติเหตุ",
    path: "/accident-insurance",
    defaultTitle: "คำถามเกี่ยวกับประกันอุบัติเหตุ",
  },
  {
    category: "property",
    label: "ประกันบ้าน คอนโด หอพัก",
    path: "/property-insurance",
    defaultTitle: "คำถามเกี่ยวกับประกันบ้าน คอนโด หอพัก",
  },
];

type FaqSectionSettings = Partial<Record<FaqCategory, { title?: string }>>;

export function getFaqCategoryConfig(category: FaqCategory) {
  const config = FAQ_CATEGORIES.find((item) => item.category === category);
  if (!config) {
    throw new Error(`Unsupported FAQ category: ${category}`);
  }
  return config;
}

export function parseFaqSectionSettings(value: unknown): FaqSectionSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as FaqSectionSettings;
}

export async function getFaqSection(
  category: FaqCategory,
  fallbackItems?: Array<{ question: string; answer: string }>,
): Promise<FaqSectionView> {
  const config = getFaqCategoryConfig(category);
  const defaults = fallbackItems || DEFAULT_FAQS[category];

  try {
    const [setting, items] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "faqSections" } }),
      prisma.faqItem.findMany({
        where: { category },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const settings = parseFaqSectionSettings(setting?.value);
    const dbItems = items.map((item) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      order: item.order,
    }));

    return {
      category,
      label: config.label,
      path: config.path,
      eyebrow: "คำถามที่พบบ่อย",
      title: settings[category]?.title?.trim() || config.defaultTitle,
      items: dbItems.length > 0 ? dbItems : defaults.map((item, index) => ({ ...item, order: index })),
    };
  } catch {
    return {
      category,
      label: config.label,
      path: config.path,
      eyebrow: "คำถามที่พบบ่อย",
      title: config.defaultTitle,
      items: defaults.map((item, index) => ({ ...item, order: index })),
    };
  }
}
