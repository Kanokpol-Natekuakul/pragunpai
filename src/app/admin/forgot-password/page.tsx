import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50">
      <Container size="prose">
        <div className="rounded-xl border border-navy-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-navy-800">ลืมรหัสผ่าน</h1>
            <p className="mt-1 text-sm text-navy-500">
              กรอกอีเมลที่ใช้ลงทะเบียน เราจะส่งลิงก์ตั้งรหัสผ่านใหม่
            </p>
          </div>
          <form action="/api/auth/forgot-password" method="POST">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy-700">
                  อีเมล
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@pragunpai.com"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm">
            <a href="/admin/login" className="text-navy-500 hover:text-navy-700">
              กลับหน้าเข้าสู่ระบบ
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
