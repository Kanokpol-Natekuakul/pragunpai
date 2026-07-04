import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { PageBannersEditor, BannersMapVal } from "@/components/admin/PageBannersEditor";
import { bannerPages, getPageBannersMap } from "@/lib/banners";

export const dynamic = "force-dynamic";

export default async function BannersAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  const bannersMap = (await getPageBannersMap()) as BannersMapVal;

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">แบนเนอร์สไลด์ (Banner Slides)</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          เพิ่มรูปแบนเนอร์สไลด์เลื่อนอัตโนมัติให้แต่ละหน้าของเว็บไซต์ รูปจะแสดงต่อจากแบนเนอร์เดิมของหน้านั้น
          หากหน้าใดไม่มีรูป จะแสดงแบนเนอร์เดิมตามปกติ
        </p>
      </div>

      <PageBannersEditor pages={bannerPages} initialBanners={bannersMap} />
    </Container>
  );
}
