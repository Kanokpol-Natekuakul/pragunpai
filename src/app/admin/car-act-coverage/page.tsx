import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import {
  CarActCoverageEditor,
  CoverageRow,
} from "@/components/admin/CarActCoverageEditor";

export const dynamic = "force-dynamic";

export default async function CarActCoverageAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch setting from DB
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "carActCoverage" },
  });

  const initialRows = Array.isArray(setting?.value)
    ? (setting.value as unknown as CoverageRow[])
    : [];

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">
          จัดการตารางความคุ้มครอง พ.ร.บ.
        </h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          ปรับแต่งข้อมูลรายการและจำนวนเงินความคุ้มครองที่จะนำไปแสดงในหน้าข้อมูล
          พ.ร.บ. (ตารางความคุ้มครอง พ.ร.บ.)
        </p>
      </div>

      <CarActCoverageEditor initialRows={initialRows} />
    </Container>
  );
}
