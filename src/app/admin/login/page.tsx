"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login-step1", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
        setLoading(false);
        return;
      }

      // Store email for step 2
      sessionStorage.setItem("otp_email", form.get("email") as string);
      router.push("/admin/login/verify");
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50">
      <Container size="prose">
        <div className="rounded-xl border border-navy-100 bg-white p-8 shadow-sm">
          {/* Brand */}
          <div className="mb-6 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-600 text-white text-lg font-bold">
              P
            </span>
            <h1 className="mt-3 text-xl font-bold text-navy-800">
              เข้าสู่ระบบหลังบ้าน
            </h1>
            <p className="mt-1 text-sm text-navy-500">{siteConfig.name}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login form — Step 1 */}
          <form id="login-step1" onSubmit={handleSubmit}>
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
                  autoComplete="email"
                  placeholder="admin@pragunpai.com"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy-700">
                  รหัสผ่าน
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </Button>
            </div>
          </form>

          {/* Forgot password link */}
          <p className="mt-4 text-center text-sm">
            <a href="/admin/forgot-password" className="text-navy-500 hover:text-navy-700">
              ลืมรหัสผ่าน?
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}

