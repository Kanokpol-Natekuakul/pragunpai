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
    label: "ประกันทรัพย์สิน",
    path: "/property-insurance",
    defaultTitle: "คำถามเกี่ยวกับประกันทรัพย์สิน",
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
  fallbackItems: Array<{ question: string; answer: string }> = [],
): Promise<FaqSectionView> {
  const config = getFaqCategoryConfig(category);

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
      items: dbItems.length > 0 ? dbItems : fallbackItems.map((item, index) => ({ ...item, order: index })),
    };
  } catch {
    return {
      category,
      label: config.label,
      path: config.path,
      eyebrow: "คำถามที่พบบ่อย",
      title: config.defaultTitle,
      items: fallbackItems.map((item, index) => ({ ...item, order: index })),
    };
  }
}
