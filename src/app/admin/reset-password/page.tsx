import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  // Next.js 15: searchParams is a Promise
  // We render the form and fill token via JS to avoid SSR issues.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50">
      <Container size="prose">
        <div className="rounded-xl border border-navy-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-navy-800">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="mt-1 text-sm text-navy-500">กรอกรหัสผ่านใหม่ของคุณ</p>
          </div>
          <form action="/api/auth/reset-password" method="POST">
            <input type="hidden" name="token" id="reset-token" />
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-navy-700"
                >
                  รหัสผ่านใหม่
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-navy-700"
                >
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
              >
                ตั้งรหัสผ่านใหม่
              </button>
            </div>
          </form>
          <p className="mt-4 text-center text-sm">
            <a
              href="/admin/login"
              className="text-navy-500 hover:text-navy-700"
            >
              กลับหน้าเข้าสู่ระบบ
            </a>
          </p>
        </div>
      </Container>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token');
            if (token) document.getElementById('reset-token').value = token;
          `,
        }}
      />
    </div>
  );
}
