import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { InsurancePageEditor } from "@/components/admin/InsurancePageEditor";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditInsurancePageAdmin({ params }: Props) {
  await requireAuth().catch(() => redirect("/admin/login"));

  const { id } = await params;

  // Retrieve the page and the comparison rows
  const page = await prisma.insurancePage.findUnique({
    where: { id },
    include: {
      comparisonTable: {
        include: {
          rows: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <Container size="wide" className="py-4">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Link
          href="/admin/insurance-pages"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800"
        >
          ← ย้อนกลับไปหน้าจัดการแผนประกัน
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800">จัดการข้อมูล {page.name}</h1>
        <p className="text-sm text-navy-500 font-medium">แก้ไขโครงสร้างเนื้อหา ลิงก์ PDF และตารางเปรียบเทียบในหน้าแผนประกัน</p>
      </div>

      <InsurancePageEditor page={page} />
    </Container>
  );
}
