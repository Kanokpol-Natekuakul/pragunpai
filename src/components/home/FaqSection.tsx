import { FaqSectionBlock } from "@/components/faq/FaqSectionBlock";
import { getFaqSection } from "@/lib/faqs";

const fallbackFaqs = [
  {
    question: "Pragunpai เป็นบริษัทประกันภัยหรือไม่?",
    answer:
      "Pragunpai เป็นที่ปรึกษาและผู้เปรียบเทียบแผนประกันภัย ไม่ใช่บริษัทประกันโดยตรง เราเปรียบเทียบแผนจากบริษัทประกันชั้นนำ เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ",
  },
  {
    question: "การขอใบเสนอราคาผ่านเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
    answer:
      "การขอใบเสนอราคาผ่านเว็บไซต์ Pragunpai ไม่มีค่าใช้จ่าย เพียงกรอกฟอร์มและเจ้าหน้าที่จะติดต่อกลับเพื่อเสนอแผนที่เหมาะสม",
  },
];

export async function FaqSection() {
  const section = await getFaqSection("general", fallbackFaqs);

  return <FaqSectionBlock section={section} className="bg-white py-20" />;
}
