import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { AccountSettingsEditor } from "@/components/admin/AccountSettingsEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ตั้งค่าบัญชี",
};

export default async function AccountSettingsPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch latest user details from DB to make sure they are up-to-date
  const admin = await prisma.admin.findUnique({
    where: { id: session.sub },
    select: { name: true, email: true },
  });

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">ตั้งค่าบัญชีผู้ใช้ (Account Settings)</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          แก้ไขข้อมูลส่วนตัว อีเมลล็อกอิน และเปลี่ยนรหัสผ่านเพื่อความปลอดภัยในการเข้าใช้งานระบบหลังบ้าน
        </p>
      </div>

      <AccountSettingsEditor initialName={admin.name} initialEmail={admin.email} />
    </Container>
  );
}
