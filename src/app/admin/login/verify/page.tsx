"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("otp_email");
    if (!stored) {
      router.replace("/admin/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(stored);
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    form.set("email", email);

    try {
      const res = await fetch("/api/auth/login-step2", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "รหัส OTP ไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // Login success — clear storage and go to dashboard
      sessionStorage.removeItem("otp_email");
      router.push("/admin/dashboard");
    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50">
      <Container size="prose">
        <div className="rounded-xl border border-navy-100 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-navy-800">ยืนยันตัวตนด้วย OTP</h1>
            <p className="mt-1 text-sm text-navy-500">
              รหัส OTP ถูกส่งไปที่อีเมลของคุณแล้ว (หมดอายุใน 10 นาที)
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form id="otp-form" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-navy-700">
                รหัส OTP (6 หลัก)
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                autoFocus
                placeholder="123456"
                className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-navy-800 placeholder:text-navy-300 focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส OTP"}
            </button>
          </form>
          <p className="mt-3 text-center text-sm">
            <a href="/admin/login" className="text-navy-500 hover:text-navy-700">
              กลับหน้าเข้าสู่ระบบ
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}

